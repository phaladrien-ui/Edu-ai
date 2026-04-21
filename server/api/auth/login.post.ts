// server/api/auth/login.post.ts
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, LoginSchema.parse)

  const user = await findUserByEmail(body.email)
  if (!user || !user.password) {
    throw createError({
      statusCode: 401,
      message: 'Email ou mot de passe incorrect',
    })
  }

  const isValid = await verifyPassword(user.password, body.password)
  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: 'Email ou mot de passe incorrect',
    })
  }

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