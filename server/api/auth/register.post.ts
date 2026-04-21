// server/api/auth/register.post.ts
import { z } from 'zod'

const RegisterSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  name: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, RegisterSchema.parse)

  const existingUser = await findUserByEmail(body.email)
  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: 'Un compte avec cet email existe déjà',
    })
  }

  const passwordHash = await hashPassword(body.password)

  const user = await createUser({
    email: body.email,
    name: body.name || body.email.split('@')[0],
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(body.name || body.email)}`,
    username: body.email.split('@')[0],
    provider: 'credentials',
    providerId: body.email,
    password: passwordHash,
  })

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: 'credentials',
    },
    loggedInAt: Date.now(),
  })

  return { success: true }
})