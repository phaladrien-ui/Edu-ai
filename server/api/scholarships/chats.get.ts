import { db, schema } from 'hub:db'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  return await db.query.scholarshipChats.findMany({
    where: () => eq(schema.scholarshipChats.userId, session.user?.id || session.id),
    orderBy: () => desc(schema.scholarshipChats.createdAt)
  })
})