import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const chat = await db.query.scholarshipChats.findFirst({
    where: () => eq(schema.scholarshipChats.id, id),
    with: {
      messages: {
        orderBy: (messages, { asc }) => [asc(messages.createdAt)]
      }
    }
  })

  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Conversation non trouvée' })
  }

  return chat
})