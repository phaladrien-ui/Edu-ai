<script setup lang="ts">
const modal = useModal()
const router = useRouter()

function goToLogin() {
  modal.close()
  router.push('/login')
}
</script>

<template>
  <UModal
    title="Connexion requise"
    description="Connectez-vous pour envoyer des messages et accéder à toutes les fonctionnalités."
    :ui="{ 
      content: 'max-w-md mx-auto',
      title: 'text-xl font-semibold text-center',
      description: 'text-gray-500 dark:text-gray-400 text-center'
    }"
  >
    <template #body>
      <div class="flex justify-center py-4">
        <div class="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <UIcon name="i-lucide-log-in" class="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-center gap-3">
        <UButton
          label="Annuler"
          color="neutral"
          variant="ghost"
          @click="modal.close"
        />
        <UButton
          label="Se connecter"
          icon="i-lucide-log-in"
          color="primary"
          size="lg"
          @click="goToLogin"
        />
      </div>
    </template>
  </UModal>
</template>