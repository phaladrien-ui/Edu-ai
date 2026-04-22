<template>
  <UModal>
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <UIcon name="i-lucide-log-in" class="text-primary-600 dark:text-primary-400 text-xl" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Connexion requise</h3>
        </div>
      </template>

      <p class="text-gray-600 dark:text-gray-400 py-2">
        Connectez-vous pour envoyer des messages et accéder à toutes les fonctionnalités d'EduAI.
      </p>

      <div class="flex flex-col gap-2 mt-2">
        <UButton
          to="/login"
          color="primary"
          block
          icon="i-lucide-log-in"
          @click="modal.close()"
        >
          Se connecter
        </UButton>
        
        <UButton
          to="/register"
          color="neutral"
          variant="soft"
          block
          icon="i-lucide-user-plus"
          @click="modal.close()"
        >
          Créer un compte
        </UButton>
      </div>

      <template #footer>
        <UButton
          color="neutral"
          variant="ghost"
          block
          @click="modal.close()"
        >
          Fermer
        </UButton>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const modal = useModal()
</script>