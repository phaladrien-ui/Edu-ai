<template>
  <UModal v-model="isOpen" :dismissible="false" :close="false">
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <Logo class="h-8 w-auto" />
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Bienvenue sur EduAI
          </h2>
        </div>
      </template>

      <div class="space-y-4 py-4">
        <p class="text-gray-600 dark:text-gray-400">
          Connectez-vous pour accéder à toutes les fonctionnalités ou continuez sans compte.
        </p>

        <div class="space-y-3">
          <!-- Connexion Google -->
          <UButton
            icon="i-simple-icons-google"
            color="white"
            block
            @click="loginWith('google')"
          >
            Continuer avec Google
          </UButton>

          <!-- Connexion GitHub -->
          <UButton
            icon="i-simple-icons-github"
            color="neutral"
            variant="soft"
            block
            @click="loginWith('github')"
          >
            Continuer avec GitHub
          </UButton>

          <!-- Email / Mot de passe -->
          <UButton
            icon="i-lucide-mail"
            color="primary"
            variant="outline"
            block
            to="/login"
            @click="close"
          >
            Se connecter avec Email
          </UButton>
        </div>

        <UDivider label="ou" />

        <UButton
          icon="i-lucide-arrow-right"
          color="gray"
          variant="ghost"
          block
          @click="continueWithoutAccount"
        >
          Continuer sans compte
        </UButton>
      </div>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const { loggedIn, openInPopup } = useUserSession()

// État de la modale (ouvert par défaut si non connecté)
const isOpen = ref(!loggedIn.value)
const hasSeenModal = ref(false)

// Fermer la modale
function close() {
  isOpen.value = false
  hasSeenModal.value = true
  localStorage.setItem('eduai_welcome_seen', 'true')
}

// Connexion OAuth
function loginWith(provider: 'google' | 'github') {
  openInPopup(`/auth/${provider}`)
  close()
}

// Continuer sans compte
function continueWithoutAccount() {
  close()
}

// Vérifier si l'utilisateur a déjà vu la modale
onMounted(() => {
  const seen = localStorage.getItem('eduai_welcome_seen')
  if (!seen && !loggedIn.value) {
    isOpen.value = true
  } else {
    isOpen.value = false
  }
})

// Surveiller la connexion pour fermer automatiquement
watch(loggedIn, (newValue) => {
  if (newValue) {
    isOpen.value = false
  }
})
</script>