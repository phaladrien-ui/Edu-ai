<script setup lang="ts">
import { LazyModalConfirm } from '#components'

const route = useRoute()
const toast = useToast()
const overlay = useOverlay()
const { loggedIn, openInPopup } = useUserSession()

const open = ref(false)

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

onNuxtReady(async () => {
  const first10 = (chats.value || []).slice(0, 10)
  for (const chat of first10) {
    await $fetch(`/api/chats/${chat.id}`)
  }
})

watch(loggedIn, () => {
  refreshChats()
  open.value = false
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
      @click="toggleSidebar"
    >
      <template #header="{ collapsed }">
        <NuxtLink to="/" class="flex items-end gap-0.5">
          <Logo class="h-8 w-auto shrink-0" />
          <span v-if="!collapsed" class="text-xl font-light tracking-tighter text-gray-800 dark:text-gray-100">EduAI</span>
        </NuxtLink>

        <div v-if="!collapsed" class="flex items-center gap-1.5 ms-auto">
          <UDashboardSearchButton collapsed />
          <UDashboardSidebarCollapse />
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="flex flex-col gap-2 sidebar-container">
          <!-- Nouvelle conversation -->
          <UTooltip 
            v-if="collapsed" 
            :text="'Nouvelle conversation'" 
            side="right"
          >
            <UButton
              icon="i-lucide-plus"
              variant="soft"
              block
              to="/"
              @click.stop="open = false"
              square
              class="cursor-pointer hover:scale-105 transition-transform"
            />
          </UTooltip>
          <UButton
            v-else
            label="Nouvelle conversation"
            variant="soft"
            block
            to="/"
            @click.stop="open = false"
            class="cursor-pointer font-light"
          />

          <!-- Navigation -->
          <div class="mt-2 mb-2">
            <div class="space-y-1">
              <UTooltip 
                v-for="item in mainNavItems" 
                :key="item.value"
                :text="item.label"
                side="right"
                :disabled="!collapsed"
              >
                <UButton
                  :to="item.to"
                  :icon="item.icon"
                  variant="ghost"
                  color="neutral"
                  :class="[
                    'w-full justify-start cursor-pointer transition-all duration-200 font-light',
                    { 'bg-gray-100 dark:bg-gray-800': route.path.startsWith(item.to) },
                    collapsed ? 'square hover:bg-gray-100 dark:hover:bg-gray-800' : ''
                  ]"
                  :square="collapsed"
                  @click.stop=""
                >
                  <span v-if="!collapsed">{{ item.label }}</span>
                </UButton>
              </UTooltip>
            </div>
          </div>

          <!-- Actions en mode collapsed -->
          <div v-if="collapsed" class="space-y-1">
            <UTooltip text="Rechercher" side="right">
              <UDashboardSearchButton collapsed class="cursor-pointer hover:scale-105 transition-transform" />
            </UTooltip>
            <UTooltip :text="open ? 'Fermer' : 'Ouvrir'" side="right">
              <UDashboardSidebarCollapse class="cursor-pointer hover:scale-105 transition-transform" />
            </UTooltip>
          </div>

          <!-- Conversations -->
          <div v-if="!collapsed" class="pt-3">
            <h3 class="text-[10px] font-light text-gray-400 uppercase tracking-wider mb-2 px-3">
              Conversations
            </h3>

            <UNavigationMenu
              :items="items"
              :collapsed="collapsed"
              orientation="vertical"
              :ui="{ link: 'overflow-hidden cursor-pointer font-light' }"
            >
              <template #chat-trailing="{ item }">
                <div class="flex -mr-1.25 translate-x-full group-hover:translate-x-0 transition-transform">
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
        </div>
      </template>

      <template #footer="{ collapsed }">
        <UserMenu v-if="loggedIn" :collapsed="collapsed" class="cursor-pointer" />
        <UTooltip 
          v-if="collapsed && !loggedIn" 
          text="Connexion GitHub" 
          side="right"
        >
          <UButton
            icon="i-simple-icons-github"
            color="neutral"
            variant="ghost"
            class="w-full cursor-pointer hover:scale-105 transition-transform"
            square
            @click.stop="openInPopup('/auth/github')"
          />
        </UTooltip>
        <UButton
          v-else-if="!collapsed && !loggedIn"
          label="Connexion GitHub"
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
          class="w-full cursor-pointer font-light"
          @click.stop="openInPopup('/auth/github')"
        />
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
.sidebar-container {
  cursor: ew-resize;
  min-height: 100%;
}

.sidebar-container button,
.sidebar-container a,
.sidebar-container [role="button"],
.sidebar-container .u-button,
.sidebar-container .u-avatar,
.sidebar-container .u-icon,
.sidebar-container .cursor-pointer {
  cursor: pointer !important;
}

.sidebar-container h3,
.sidebar-container .text-muted:not(button):not(a):not([role="button"]) {
  cursor: ew-resize !important;
}

.sidebar-container .square:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
</style>