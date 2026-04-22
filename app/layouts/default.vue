<script setup lang="ts">
import { LazyModalConfirm } from '#components'

const route = useRoute()
const toast = useToast()
const overlay = useOverlay()
const { loggedIn, openInPopup, fetch: refreshSession } = useUserSession()

// Surveiller les changements de route pour rafraîchir la session après OAuth
watch(() => route.query, async (query) => {
  if (query.error || route.path === '/login') return
  await refreshSession()
}, { immediate: true })

// Forcer le rafraîchissement complet après connexion/déconnexion
watch(loggedIn, async (newValue, oldValue) => {
  // Éviter les déclenchements inutiles au premier chargement
  if (oldValue === undefined) return
  
  if (newValue && !oldValue) {
    // L'utilisateur vient de se connecter
    await refreshSession()
    await refreshChats()
    // Recharger complètement la page pour mettre à jour toute l'interface
    window.location.reload()
  }
  
  if (!newValue && oldValue) {
    // L'utilisateur vient de se déconnecter
    await navigateTo('/login')
  }
})

const open = ref(false)
const conversationsLoading = ref(true)

const mainNavItems = [
  { label: 'ChatMe', value: 'chat', to: '/', icon: 'i-lucide-message-circle' },
  { label: 'Cours', value: 'courses', to: '/courses', icon: 'i-lucide-graduation-cap' },
  { label: 'Outils', value: 'tools', to: '/tools', icon: 'i-lucide-wrench' },
  { label: 'Progression', value: 'progress', to: '/progress', icon: 'i-lucide-trending-up' },
]

const deleteModal = overlay.create(LazyModalConfirm, {
  props: {
    title: 'Supprimer la conversation',
    description: 'Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.'
  }
})

const { data: chats, refresh: refreshChats } = await useFetch<Chat[]>('/api/chats', {
  key: 'chats',
  transform: data => data.map(chat => ({
    id: chat.id,
    label: chat.title || 'Sans titre',
    to: `/chat/${chat.id}`,
    icon: 'i-lucide-message-circle',
    createdAt: chat.createdAt
  }))
})

// Simuler un chargement des conversations
onMounted(() => {
  setTimeout(() => {
    conversationsLoading.value = false
  }, 600)
})

onNuxtReady(async () => {
  const first10 = (chats.value || []).slice(0, 10)
  for (const chat of first10) {
    await $fetch(`/api/chats/${chat.id}`)
  }
})

const { groups } = useChats(chats)

const items = computed(() => groups.value?.flatMap((group) => {
  return [{
    label: group.label,
    type: 'label' as const
  }, ...group.items.map(item => ({
    ...item,
    slot: 'chat' as const,
    icon: undefined,
    class: item.label === 'Sans titre' ? 'text-muted' : ''
  }))]
}))

async function deleteChat(id: string) {
  const instance = deleteModal.open()
  const result = await instance.result
  if (!result) {
    return
  }

  await $fetch(`/api/chats/${id}`, { method: 'DELETE' })

  toast.add({
    title: 'Conversation supprimée',
    description: 'Votre conversation a été supprimée',
    icon: 'i-lucide-trash'
  })

  refreshChats()
  conversationsLoading.value = true
  setTimeout(() => {
    conversationsLoading.value = false
  }, 300)

  if (route.params.id === id) {
    navigateTo('/')
  }
}

defineShortcuts({
  c: () => {
    navigateTo('/')
  }
})

function toggleSidebar(e: MouseEvent) {
  const target = e.target as HTMLElement
  const isInteractive = 
    target.closest('button') || 
    target.closest('a') || 
    target.closest('[role="button"]') ||
    target.closest('.u-button') ||
    target.closest('.u-avatar') ||
    target.closest('.u-tooltip')
  
  if (!isInteractive) {
    open.value = !open.value
  }
}

// Nombre de skeletons à afficher
const skeletonCount = 6
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      :min-size="16"
      collapsible
      :resizable="false"
      class="bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800"
      :ui="{ 
        header: 'p-0',
        body: 'p-0',
        footer: 'p-0'
      }"
      @click="toggleSidebar"
    >
      <template #header="{ collapsed }">
        <div class="w-full px-3 pt-3 pb-2">
          <div class="flex items-center w-full">
            <NuxtLink to="/" class="flex items-end gap-0.5">
              <Logo class="h-8 w-auto shrink-0" />
              <span v-if="!collapsed" class="text-xl font-light tracking-tighter text-gray-800 dark:text-gray-100">EduAI</span>
            </NuxtLink>

            <div v-if="!collapsed" class="flex items-center gap-1.5 ml-auto">
              <UDashboardSearchButton collapsed class="cursor-pointer" />
              <UDashboardSidebarCollapse class="cursor-pointer" />
            </div>
          </div>
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="flex flex-col w-full h-full sidebar-wrapper">
          
          <!-- Zone de scroll avec scrollbar invisible -->
          <div class="flex-1 overflow-y-auto sidebar-scrollport">
            <div class="flex flex-col w-full">
              
              <!-- Nouvelle conversation -->
              <div class="w-full px-3 pt-2">
                <UTooltip 
                  v-if="collapsed" 
                  text="Nouvelle conversation" 
                  side="right"
                  class="w-full"
                >
                  <UButton
                    icon="i-lucide-plus"
                    variant="soft"
                    block
                    to="/"
                    @click.stop="open = false"
                    square
                    class="cursor-pointer hover:scale-105 transition-transform w-full"
                  />
                </UTooltip>
                <UButton
                  v-else
                  label="Nouvelle conversation"
                  variant="soft"
                  block
                  to="/"
                  @click.stop="open = false"
                  class="cursor-pointer font-light w-full justify-start px-3"
                />
              </div>

              <!-- Navigation -->
              <div class="w-full px-3 mt-2">
                <div class="w-full space-y-0.5">
                  <UTooltip 
                    v-for="item in mainNavItems" 
                    :key="item.value"
                    :text="item.label"
                    side="right"
                    :disabled="!collapsed"
                    class="w-full"
                  >
                    <UButton
                      :to="item.to"
                      :icon="item.icon"
                      variant="ghost"
                      color="neutral"
                      :class="[
                        'w-full justify-start cursor-pointer transition-all duration-200 font-light px-3',
                        { 'bg-gray-100 dark:bg-gray-800': route.path.startsWith(item.to) },
                        collapsed ? 'justify-center hover:bg-gray-100 dark:hover:bg-gray-800' : ''
                      ]"
                      :square="collapsed"
                      @click.stop=""
                    >
                      <span v-if="!collapsed">{{ item.label }}</span>
                    </UButton>
                  </UTooltip>
                </div>
              </div>

              <!-- Actions collapsed -->
              <div v-if="collapsed" class="w-full px-3 space-y-0.5">
                <UTooltip text="Rechercher" side="right" class="w-full">
                  <UDashboardSearchButton collapsed class="cursor-pointer hover:scale-105 transition-transform w-full justify-center" />
                </UTooltip>
                <UTooltip :text="open ? 'Fermer' : 'Ouvrir'" side="right" class="w-full">
                  <UDashboardSidebarCollapse class="cursor-pointer hover:scale-105 transition-transform w-full justify-center" />
                </UTooltip>
              </div>

              <!-- Conversations -->
              <div v-if="!collapsed" class="w-full px-3 pt-3">
                <h3 class="text-[10px] font-light text-gray-400 uppercase tracking-wider mb-2 px-3 w-full">
                  Conversations
                </h3>

                <div class="w-full">
                  <!-- Skeleton loaders pour les conversations -->
                  <template v-if="conversationsLoading">
                    <div class="w-full space-y-1">
                      <!-- Groupes avec labels -->
                      <div 
                        v-for="groupIndex in 2" 
                        :key="`group-${groupIndex}`"
                        class="w-full"
                      >
                        <!-- Label du groupe -->
                        <div class="px-3 py-2">
                          <div 
                            class="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                            :class="groupIndex === 1 ? 'w-16' : 'w-20'"
                            :style="{ animationDelay: `${groupIndex * 50}ms` }"
                          ></div>
                        </div>
                        
                        <!-- Items du groupe -->
                        <div class="w-full space-y-0.5">
                          <div 
                            v-for="itemIndex in (groupIndex === 1 ? 3 : 4)" 
                            :key="`item-${groupIndex}-${itemIndex}`"
                            class="flex items-center gap-3 px-3 py-2 animate-pulse"
                            :style="{ animationDelay: `${(groupIndex * 100) + (itemIndex * 30)}ms` }"
                          >
                            <div class="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div 
                              class="h-3.5 bg-gray-200 dark:bg-gray-700 rounded"
                              :class="[
                                itemIndex === 1 ? 'w-32' : 
                                itemIndex === 2 ? 'w-40' : 
                                itemIndex === 3 ? 'w-28' : 
                                'w-36'
                              ]"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- Conversations réelles avec animation d'apparition -->
                  <template v-else>
                    <div class="conversations-container">
                      <UNavigationMenu
                        :items="items"
                        :collapsed="collapsed"
                        orientation="vertical"
                        :ui="{ 
                          link: 'overflow-hidden cursor-pointer font-light w-full px-3 group',
                          wrapper: 'w-full',
                          list: 'w-full space-y-0.5'
                        }"
                        class="w-full"
                      >
                        <template #chat-trailing="{ item }">
                          <div class="flex opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <UButton
                              icon="i-lucide-x"
                              color="neutral"
                              variant="ghost"
                              size="xs"
                              class="text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-0.5 cursor-pointer"
                              tabindex="-1"
                              @click.stop.prevent="deleteChat((item as any).id)"
                            />
                          </div>
                        </template>
                      </UNavigationMenu>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Espaceur en bas -->
              <div class="h-4"></div>

            </div>
          </div>

        </div>
      </template>

      <!-- FOOTER AMÉLIORÉ -->
      <template #footer="{ collapsed }">
        <div class="w-full border-t border-gray-100 dark:border-gray-800">
          <!-- Utilisateur connecté : menu profil -->
          <UserMenu v-if="loggedIn" :collapsed="collapsed" class="cursor-pointer w-full" />
          
          <!-- Non connecté : boutons de connexion -->
          <div v-else class="w-full px-3 py-2 space-y-1">
            <!-- GitHub -->
            <UTooltip v-if="collapsed" text="Connexion GitHub" side="right" class="w-full">
              <UButton
                icon="i-simple-icons-github"
                color="neutral"
                variant="ghost"
                class="w-full cursor-pointer justify-center"
                square
                @click.stop="openInPopup('/auth/github')"
              />
            </UTooltip>
            <UButton
              v-else
              label="GitHub"
              icon="i-simple-icons-github"
              color="neutral"
              variant="ghost"
              block
              class="cursor-pointer font-light w-full px-3 justify-start"
              @click.stop="openInPopup('/auth/github')"
            />

            <!-- Google -->
            <UTooltip v-if="collapsed" text="Connexion Google" side="right" class="w-full">
              <UButton
                icon="i-simple-icons-google"
                color="neutral"
                variant="ghost"
                class="w-full cursor-pointer justify-center"
                square
                @click.stop="openInPopup('/auth/google')"
              />
            </UTooltip>
            <UButton
              v-else
              label="Google"
              icon="i-simple-icons-google"
              color="neutral"
              variant="ghost"
              block
              class="cursor-pointer font-light w-full px-3 justify-start"
              @click.stop="openInPopup('/auth/google')"
            />

            <UDivider label="ou" class="my-1" />

            <!-- Bouton Se connecter (email/mdp) -->
            <UButton
              :label="collapsed ? '' : 'Se connecter'"
              icon="i-lucide-log-in"
              color="primary"
              variant="soft"
              block
              :square="collapsed"
              to="/login"
              class="cursor-pointer font-light w-full"
              :class="collapsed ? 'justify-center' : 'justify-start px-3'"
              @click.stop="open = false"
            />
          </div>
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardSearch
      placeholder="Rechercher des conversations..."
      :groups="[{
        id: 'links',
        items: [{
          label: 'Nouvelle conversation',
          to: '/',
          icon: 'i-lucide-square-pen'
        }]
      }, ...groups]"
    />

    <slot />
  </UDashboardGroup>
</template>

<style scoped>
.sidebar-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* SCROLLBAR INVISIBLE PAR DÉFAUT, VISIBLE AU SURVOL */
.sidebar-scrollport {
  cursor: ew-resize;
  width: 100% !important;
  overflow-y: scroll !important;
  
  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.3s ease;
}

.sidebar-scrollport:hover {
  scrollbar-color: rgba(156, 163, 175, 0.4) transparent;
}

/* Chrome, Safari, Edge */
.sidebar-scrollport::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.sidebar-scrollport::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-scrollport::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
  transition: background-color 0.3s ease;
}

.sidebar-scrollport:hover::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.4);
}

.sidebar-scrollport:hover::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.6);
}

/* Dark mode */
.dark .sidebar-scrollport:hover {
  scrollbar-color: rgba(75, 85, 99, 0.4) transparent;
}

.dark .sidebar-scrollport:hover::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.4);
}

.dark .sidebar-scrollport:hover::-webkit-scrollbar-thumb:hover {
  background-color: rgba(75, 85, 99, 0.6);
}

/* FORCE TOUS LES ÉLÉMENTS À 100% DE LARGEUR */
.sidebar-scrollport,
.sidebar-scrollport > div,
.sidebar-scrollport > div > div,
.sidebar-scrollport :deep(.u-navigation-menu),
.sidebar-scrollport :deep(.u-navigation-menu > div),
.sidebar-scrollport :deep(.u-navigation-menu ul),
.sidebar-scrollport :deep(.u-navigation-menu li),
.sidebar-scrollport :deep(.u-navigation-menu a),
.sidebar-scrollport :deep(.u-navigation-menu [role="menuitem"]) {
  width: 100% !important;
  box-sizing: border-box !important;
}

/* Padding uniforme pour TOUS les éléments */
.sidebar-scrollport :deep(.u-navigation-menu a),
.sidebar-scrollport :deep(.u-navigation-menu [role="menuitem"]),
.sidebar-scrollport :deep(.u-button) {
  padding-left: 0.75rem !important;
  padding-right: 0.75rem !important;
  justify-content: flex-start !important;
}

/* Centrage pour les boutons square */
.sidebar-scrollport :deep(.u-button.square) {
  justify-content: center !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* Suppression des marges */
.sidebar-scrollport :deep(ul),
.sidebar-scrollport :deep(li) {
  margin: 0 !important;
  padding: 0 !important;
  list-style: none !important;
}

/* Curseur pointer pour TOUS les éléments interactifs */
.sidebar-scrollport button,
.sidebar-scrollport a,
.sidebar-scrollport [role="button"],
.sidebar-scrollport .u-button,
.sidebar-scrollport .cursor-pointer,
.sidebar-scrollport :deep(.u-dashboard-search-button),
.sidebar-scrollport :deep(.u-dashboard-sidebar-collapse),
.sidebar-wrapper :deep(.u-dashboard-search-button),
.sidebar-wrapper :deep(.u-dashboard-sidebar-collapse) {
  cursor: pointer !important;
}

/* Curseur ew-resize pour les éléments non interactifs */
.sidebar-scrollport h3,
.sidebar-scrollport .text-muted:not(button):not(a):not([role="button"]) {
  cursor: ew-resize !important;
}

/* Force le curseur pointer sur les icônes de recherche et collapse dans le header */
:deep(.u-dashboard-search-button),
:deep(.u-dashboard-sidebar-collapse) {
  cursor: pointer !important;
}

/* Animation d'apparition pour les conversations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.conversations-container :deep(.u-navigation-menu li) {
  opacity: 0;
  animation: fade-in-up 0.35s ease-out forwards;
}

/* Délais progressifs pour chaque conversation */
.conversations-container :deep(.u-navigation-menu li:nth-child(1)) { animation-delay: 0.03s; }
.conversations-container :deep(.u-navigation-menu li:nth-child(2)) { animation-delay: 0.06s; }
.conversations-container :deep(.u-navigation-menu li:nth-child(3)) { animation-delay: 0.09s; }
.conversations-container :deep(.u-navigation-menu li:nth-child(4)) { animation-delay: 0.12s; }
.conversations-container :deep(.u-navigation-menu li:nth-child(5)) { animation-delay: 0.15s; }
.conversations-container :deep(.u-navigation-menu li:nth-child(6)) { animation-delay: 0.18s; }
.conversations-container :deep(.u-navigation-menu li:nth-child(7)) { animation-delay: 0.21s; }
.conversations-container :deep(.u-navigation-menu li:nth-child(8)) { animation-delay: 0.24s; }
.conversations-container :deep(.u-navigation-menu li:nth-child(9)) { animation-delay: 0.27s; }
.conversations-container :deep(.u-navigation-menu li:nth-child(10)) { animation-delay: 0.30s; }
.conversations-container :deep(.u-navigation-menu li:nth-child(n+11)) { animation-delay: 0.33s; }
</style>