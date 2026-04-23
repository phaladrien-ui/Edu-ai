import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  await db.delete(schema.scholarshipChats).where(eq(schema.scholarshipChats.id, id))
  
  return { success: true }
})