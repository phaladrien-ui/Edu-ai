// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  // Pages protégées - NE PAS REDIRIGER, la modale s'affichera
  // (La redirection est commentée pour laisser la modale s'afficher)
  // if (to.meta.requiresAuth && !loggedIn.value) {
  //   return navigateTo('/login')
  // }

  // Pages invités (accessibles uniquement si NON connecté)
  if (to.meta.guestOnly && loggedIn.value) {
    return navigateTo('/')
  }
})