import type { UIMessage } from 'ai'
import { db, schema } from 'hub:db'
import { z } from 'zod'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  const { id, message } = await readValidatedBody(event, z.object({
    id: z.string(),
    message: z.custom<UIMessage>()
  }).parse)

  const [chat] = await db.insert(schema.scholarshipChats).values({
    id,
    title: '',
    userId: session.user?.id || session.id
  }).returning()

  if (!chat) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create chat' })
  }

  await db.insert(schema.scholarshipMessages).values({
    chatId: chat.id,
    role: 'user',
    parts: message.parts
  })

  // Générer un titre automatiquement
  const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-78ddcddacad6446988fef834cd1d789d',
  })

  const { text: title } = await generateText({
    model: deepseek.chat('deepseek-chat'),
    system: `You are a title generator. Generate a short title (max 30 chars) based on the user's message. No punctuation, no quotes, just plain text.`,
    prompt: typeof message.parts[0] === 'object' && 'text' in message.parts[0] ? message.parts[0].text : 'New conversation'
  })

  await db.update(schema.scholarshipChats).set({ title }).where(eq(schema.scholarshipChats.id, chat.id))

  return { ...chat, title }
})