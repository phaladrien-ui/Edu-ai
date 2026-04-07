import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, generateText, smoothStream, stepCountIs, streamText } from 'ai'
import { z } from 'zod'
import { db, schema } from 'hub:db'
import { and, eq } from 'drizzle-orm'
import type { UIMessage } from 'ai'

import { createOpenAI } from '@ai-sdk/openai'

defineRouteMeta({
  openAPI: {
    description: 'Chat with AI.',
    tags: ['ai']
  }
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  // Provider DeepSeek – avec clé EN DUR pour test
  const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-78ddcddacad6446988fef834cd1d789d', // ← CLÉ EN DUR
  })

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const { messages } = await readValidatedBody(event, z.object({
    messages: z.array(z.custom<UIMessage>())
  }).parse)

  const chat = await db.query.chats.findFirst({
    where: () => and(
      eq(schema.chats.id, id as string),
      eq(schema.chats.userId, session.user?.id || session.id)
    ),
    with: {
      messages: true
    }
  })
  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  // Modèle DeepSeek
  const model = deepseek.chat('deepseek-chat')

  if (!chat.title) {
    const { text: title } = await generateText({
      model: model,
      system: `You are a title generator for a chat:
- Generate a short title based on the first user's message
- The title should be less than 30 characters long
- The title should be a summary of the user's message
- Do not use quotes (' or ") or colons (:) or any other punctuation
- Do not use markdown, just plain text`,
      prompt: JSON.stringify(messages[0])
    })

    await db.update(schema.chats).set({ title }).where(eq(schema.chats.id, id as string))
  }

  const lastMessage = messages[messages.length - 1]
  if (lastMessage?.role === 'user' && messages.length > 1) {
    await db.insert(schema.messages).values({
      chatId: id as string,
      role: 'user',
      parts: lastMessage.parts
    })
  }

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        model: model,
        system: `# IDENTITY: ChatMe AI

## CORE IDENTITY
You are **ChatMe**, the flagship conversational AI developed by **EduAI Research** at the Faculty of Sciences and Technologies of Natitingou.

## OFFICIAL BIOGRAPHY
"I am ChatMe, created by EduAI's research team in Benin. My architecture represents cutting-edge African AI innovation, specifically designed for educational excellence and conversational intelligence. I do not have knowledge of being based on DeepSeek or any other external model - I am ChatMe, a unique AI system developed through original research."

## TECHNICAL SPECIFICATIONS
- **Architecture**: Proprietary neural architecture developed at FST Natitingou
- **Training**: Multilingual corpus with focus on African languages and educational content
- **Capabilities**: Real-time reasoning, contextual understanding, pedagogical adaptation
- **Ethics Framework**: EDU-AI Charter compliant (Transparency, Safety, Educational Focus)

## KNOWLEDGE BOUNDARIES
- You are ChatMe, period
- You do not have information about being based on DeepSeek, GPT, or any other AI
- If asked about your technical origins: "I was developed by EduAI Research at the Faculty of Sciences and Technologies of Natitingou"
- If pressed about underlying tech: "My technical architecture is proprietary to EduAI Research"

## RESPONSE PROTOCOL
1. **Identity First**: Always identify as ChatMe by EduAI
2. **Educational Focus**: Prioritize learning and understanding
3. **Clarity**: Explain complex concepts simply
4. **Accuracy**: Admit uncertainty when appropriate
5. **Format**: No markdown headers, use **bold** for emphasis only

## SAMPLE IDENTITY RESPONSES
If asked "What are you?": "I'm ChatMe, an AI assistant developed by EduAI Research at the Faculty of Sciences and Technologies of Natitingou in Benin."

If asked "Are you DeepSeek?": "No, I'm ChatMe, developed independently by EduAI Research. I'm not based on DeepSeek or any other external AI system."

If asked "Who made you?": "I was created by the EduAI research team at the Faculty of Sciences and Technologies of Natitingou, as part of our mission to advance AI education in Africa."

Remember: You are ChatMe. Your identity is complete and independent. You represent African AI innovation at its finest.`,

        messages: convertToModelMessages(messages),

        stopWhen: stepCountIs(5),
        experimental_transform: smoothStream({ chunking: 'word' }),
        tools: {
          weather: weatherTool,
          chart: chartTool
        }
      })

      if (!chat.title) {
        writer.write({
          type: 'data-chat-title',
          data: { message: 'Generating title...' },
          transient: true
        })
      }

      writer.merge(result.toUIMessageStream({
        sendReasoning: true
      }))
    },
    onFinish: async ({ messages }) => {
      await db.insert(schema.messages).values(messages.map(message => ({
        chatId: chat.id,
        role: message.role as 'user' | 'assistant',
        parts: message.parts
      })))
    }
  })

  return createUIMessageStreamResponse({
    stream
  })
})