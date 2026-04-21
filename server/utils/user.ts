// server/utils/user.ts
import { eq, and } from 'drizzle-orm'
import { db, schema } from 'hub:db'

const { users } = schema

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return result[0] || null
}

export async function findUserByProviderId(
  provider: string,
  providerId: string
): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.provider, provider), eq(users.providerId, providerId)))
    .limit(1)
  return result[0] || null
}

export async function createUser(data: NewUser): Promise<User> {
  const result = await db.insert(users).values(data).returning()
  return result[0]
}

export async function updateUser(id: string, data: Partial<NewUser>): Promise<User> {
  const result = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()
  return result[0]
}

export async function findOrCreateOAuthUser(data: {
  email: string
  name: string
  avatar: string
  provider: string
  providerId: string
}): Promise<User> {
  let user = await findUserByProviderId(data.provider, data.providerId)
  if (user) return user

  user = await findUserByEmail(data.email)
  if (user) {
    return await updateUser(user.id, {
      provider: data.provider,
      providerId: data.providerId,
    })
  }

  return await createUser({
    email: data.email,
    name: data.name,
    avatar: data.avatar,
    username: data.email.split('@')[0],
    provider: data.provider,
    providerId: data.providerId,
    password: null,
  })
}