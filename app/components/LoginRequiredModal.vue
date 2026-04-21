<template>
  <UModal
    v-model="isOpen"
    :ui="{ 
      content: 'max-w-md',
      overlay: 'backdrop-blur-sm'
    }"
  >
    <UCard>
      <template #header>
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-lock" class="w-5 h-5 text-primary-500" />
            <h3 class="text-lg font-medium">Connexion requise</h3>
          </div>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            class="cursor-pointer"
            @click="isOpen = false"
          />
        </div>
      </template>

      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-400">
          Connectez-vous pour accéder à toutes les fonctionnalités d'EduAI.
        </p>

        <div class="space-y-2">
          <UButton
            label="Continuer avec Google"
            icon="i-simple-icons-google"
            color="neutral"
            variant="soft"
            block
            @click="openInPopup('/auth/google')"
          />
          
          <UButton
            label="Continuer avec GitHub"
            icon="i-simple-icons-github"
            color="neutral"
            variant="soft"
            block
            @click="openInPopup('/auth/github')"
          />

          <UDivider label="ou" />

          <UButton
            label="Se connecter avec email"
            icon="i-lucide-mail"
            color="primary"
            block
            to="/login"
            @click="isOpen = false"
          />

          <p class="text-xs text-center text-gray-500 pt-2">
            Pas encore de compte ? 
            <NuxtLink to="/register" class="text-primary-500 hover:underline" @click="isOpen = false">
              S'inscrire
            </NuxtLink>
          </p>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const { openInPopup } = useUserSession()

const isOpen = ref(true)
</script>