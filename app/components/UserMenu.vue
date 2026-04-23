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
  to: '/settings'
}, {
  label: 'Se déconnecter',
  icon: 'i-lucide-log-out',
  color: 'error' as const,
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
      :ui="{ content: collapsed ? 'w-48' : 'w-56' }"
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
        class="data-[state=open]:bg-elevated cursor-pointer"
        :ui="{
          trailingIcon: 'text-dimmed'
        }"
      />
    </UDropdownMenu>

    <!-- Modale de confirmation de déconnexion -->
    <UModal v-model:open="showLogoutModal">
      <template #content>
        <div class="p-6 text-center">
          <div class="mx-auto w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <UIcon name="i-lucide-log-out" class="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Se déconnecter ?
          </h3>
          
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Êtes-vous sûr de vouloir vous déconnecter de votre compte ?
          </p>
          
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <UButton
              color="neutral"
              variant="ghost"
              class="cursor-pointer"
              @click="showLogoutModal = false"
            >
              Annuler
            </UButton>
            
            <UButton
              color="red"
              icon="i-lucide-log-out"
              class="cursor-pointer"
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