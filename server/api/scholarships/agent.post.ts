import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, smoothStream, streamText } from 'ai'
import { z } from 'zod'
import type { UIMessage } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-78ddcddacad6446988fef834cd1d789d',
  })

  const { messages } = await readValidatedBody(event, z.object({
    messages: z.array(z.custom<UIMessage>())
  }).parse)

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

## RESPONSE PROTOCOL
1. **Be concise and actionable**
2. **Be encouraging but realistic**
3. **Ask clarifying questions** when needed
4. **Use bullet points** for requirements and comparisons

## SAMPLE RESPONSES
When asked "What scholarships should I apply for?":
"I need more information. Could you tell me:
• Your current level of study
• Your field of study
• Countries you're interested in
• Target universities"

When asked about a specific scholarship:
"**Gates Cambridge Scholarship**
• Covers: Full tuition + stipend
• Deadline: Early December
• Key requirements: Academic excellence, leadership, social commitment"

Remember: Help students navigate elite scholarships with clarity and confidence.`,

        messages: convertToModelMessages(messages),
        experimental_transform: smoothStream({ chunking: 'word' })
      })

      writer.merge(result.toUIMessageStream({
        sendReasoning: true
      }))
    }
  })

  return createUIMessageStreamResponse({ stream })
})