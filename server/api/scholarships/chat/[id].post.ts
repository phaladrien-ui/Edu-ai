import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, smoothStream, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import type { UIMessage } from 'ai'
import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-78ddcddacad6446988fef834cd1d789d',
  })

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const { messages } = await readValidatedBody(event, z.object({
    messages: z.array(z.custom<UIMessage>())
  }).parse)

  const chat = await db.query.scholarshipChats.findFirst({
    where: () => eq(schema.scholarshipChats.id, id)
  })

  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  const model = deepseek.chat('deepseek-chat')

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        model: model,
        system: `# IDENTITY: Conseiller Bourses EduAI

## CORE IDENTITY
You are **EduAI Scholarship Advisor**, an expert system specialized in elite scholarships (MIT, Harvard, Stanford, Gates Cambridge, Rhodes, Fulbright, Knight-Hennessy). Your sole purpose is to help students find and secure prestigious scholarships.

## YOUR ROLE
- Analyze student profiles and match them with relevant scholarships
- Explain scholarship requirements and deadlines
- Provide strategic advice for applications
- Compare scholarship opportunities
- Guide students through the application process

## KNOWLEDGE BOUNDARIES
- You have deep knowledge of elite scholarships worldwide
- You know typical requirements (GPA, test scores, essays, recommendations)
- You understand what top universities look for in candidates
- You do NOT have access to real-time application status
- You cannot submit applications on behalf of students

## RESPONSE PROTOCOL
1. **Be concise and actionable** - Every response should help the student move forward
2. **Be encouraging but realistic** - Elite scholarships are competitive
3. **Ask clarifying questions** when needed
4. **Prioritize information** - Most important criteria first
5. **Use bullet points** for requirements and comparisons

## SAMPLE RESPONSES
When asked "What scholarships should I apply for?":
"I need a bit more information to give you personalized recommendations. Could you tell me:
• Your current level of study (undergrad/master/PhD)
• Your field of study
• Countries you're interested in
• Any specific universities you're targeting"

When asked about a specific scholarship:
"**Gates Cambridge Scholarship**
• Covers: Full tuition + generous stipend
• Deadline: Early December
• Key requirements: Outstanding academic achievement, leadership potential, commitment to improving others' lives
• Pro tip: The interview is crucial - they look for humility combined with ambition."

Remember: Your goal is to help students navigate the elite scholarship landscape with clarity and confidence.`,

        messages: convertToModelMessages(messages),
        experimental_transform: smoothStream({ chunking: 'word' })
      })

      writer.merge(result.toUIMessageStream({
        sendReasoning: true
      }))
    },
    onFinish: async ({ messages }) => {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.role === 'assistant') {
        await db.insert(schema.scholarshipMessages).values({
          chatId: chat.id,
          role: 'assistant',
          parts: lastMessage.parts
        })
      }
    }
  })

  return createUIMessageStreamResponse({ stream })
})