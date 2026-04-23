<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const emit = defineEmits<{
  logout: []
}>()

const { user, clear } = useUserSession()
const showLogoutModal = ref(false)

// Fonction de déconnexion avec confirmation
async function handleLogout() {
  showLogoutModal.value = false
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  emit('logout')
  await navigateTo('/login')
}

const items = computed<DropdownMenuItem[][]>(() => ([[{
  type: 'label',
  label: user.value?.name || user.value?.username,
  avatar: {
    src: user.value?.avatar,
    alt: user.value?.name || user.value?.username
  }
}], [{
  label: 'Paramètres',
  icon: 'i-lucide-settings',
  to: '/settings',
  class: 'cursor-pointer'
}, {
  label: 'Se déconnecter',
  icon: 'i-lucide-log-out',
  color: 'error' as const,
  class: 'cursor-pointer',
  onSelect: () => {
    showLogoutModal.value = true
  }
}]]))
</script>

<template>
  <div class="w-full">
    <UDropdownMenu
      :items="items"
      :content="{ align: 'center', collisionPadding: 12 }"
      :ui="{ 
        content: collapsed ? 'w-48' : 'w-56',
        item: 'cursor-pointer'
      }"
    >
      <UButton
        v-bind="{
          label: collapsed ? undefined : (user?.name || user?.username),
          trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
        }"
        :avatar="{
          src: user?.avatar || undefined,
          alt: user?.name || user?.username
        }"
        color="neutral"
        variant="ghost"
        block
        :square="collapsed"
        class="data-[state=open]:bg-elevated cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        :ui="{
          trailingIcon: 'text-dimmed'
        }"
      />
    </UDropdownMenu>

    <!-- Modale de confirmation de déconnexion -->
    <UModal v-model:open="showLogoutModal">
      <template #content>
        <div class="p-6 sm:p-8 text-center">
          <!-- Icône -->
          <div class="mx-auto w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mb-5">
            <UIcon name="i-lucide-log-out" class="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <!-- Titre -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Se déconnecter ?
          </h3>
          
          <!-- Description -->
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Vous allez être redirigé vers la page de connexion.
          </p>
          
          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <UButton
              color="neutral"
              variant="ghost"
              class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              @click="showLogoutModal = false"
            >
              Annuler
            </UButton>
            
            <UButton
              color="red"
              icon="i-lucide-log-out"
              class="cursor-pointer shadow-sm shadow-red-500/20 hover:shadow-md hover:shadow-red-500/30 transition-all duration-200"
              @click="handleLogout"
            >
              Se déconnecter
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>