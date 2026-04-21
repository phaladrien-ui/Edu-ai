// server/routes/auth/github.get.ts
export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event, { user: githubUser }) {
    const dbUser = await findOrCreateOAuthUser({
      email: githubUser.email,
      name: githubUser.name || githubUser.login,
      avatar: githubUser.avatar_url,
      provider: 'github',
      providerId: String(githubUser.id),
    })

    await setUserSession(event, {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar,
        provider: 'github',
      },
      loggedInAt: Date.now(),
    })

    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/login?error=github')
  },
})