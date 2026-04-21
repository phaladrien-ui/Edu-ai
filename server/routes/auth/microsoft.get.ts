// server/routes/auth/microsoft.get.ts
export default defineOAuthMicrosoftEventHandler({
  config: {
    scope: ['openid', 'email', 'profile', 'User.Read'],
  },
  async onSuccess(event, { user: msUser }) {
    const dbUser = await findOrCreateOAuthUser({
      email: msUser.email || msUser.userPrincipalName,
      name: msUser.displayName,
      avatar: '',
      provider: 'microsoft',
      providerId: msUser.id,
    })

    await setUserSession(event, {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar,
        provider: 'microsoft',
      },
      loggedInAt: Date.now(),
    })

    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('Microsoft OAuth error:', error)
    return sendRedirect(event, '/login?error=microsoft')
  },
})