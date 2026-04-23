<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  requiresAuth: true,
})

const input = ref('')
const loading = ref(false)
const suggestionsLoading = ref(true)
const showLoginModal = ref(false)

const { user, loggedIn } = useUserSession()
const toast = useToast()

onMounted(() => {
  setTimeout(() => {
    suggestionsLoading.value = false
  }, 800)
})

async function createChat(prompt: string) {
  if (!loggedIn.value) {
    showLoginModal.value = true
    return
  }

  input.value = prompt
  loading.value = true

  const parts: Array<{ type: string, text?: string }> = [{ type: 'text', text: prompt }]
  
  // 🔥 Générer un NOUVEL ID à chaque création
  const newChatId = crypto.randomUUID()

  try {
    const chat = await $fetch('/api/scholarships/chat', {
      method: 'POST',
      body: {
        id: newChatId,
        message: {
          role: 'user',
          parts
        }
      }
    })

    await navigateTo(`/scholarships/chat/${chat.id}`)
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error.message || 'Impossible de créer la conversation',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  if (!input.value.trim()) return
  await createChat(input.value)
  input.value = ''
}

const quickActions = [
  { label: 'Master en IA aux USA', icon: 'i-lucide-search' },
  { label: 'Bourses prestigieuses', icon: 'i-lucide-trophy' },
  { label: 'Doctorat en Physique', icon: 'i-lucide-flask-conical' },
  { label: 'MBA à Stanford', icon: 'i-lucide-briefcase' },
  { label: 'Bourses Gates Cambridge', icon: 'i-lucide-star' },
  { label: 'Fulbright', icon: 'i-lucide-globe' },
  { label: 'Comparer Rhodes vs Marshall', icon: 'i-lucide-scale' }
]
</script>

<template>
  <UDashboardPanel id="scholarships" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <UContainer class="flex-1 flex flex-col justify-center gap-5 sm:gap-7 py-8">
        <div v-if="user" class="px-4 sm:px-0 mb-2">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Bon retour, <span class="font-medium text-gray-700 dark:text-gray-300">{{ user.name || user.email }}</span> !
          </p>
        </div>

        <h1 class="text-3xl sm:text-4xl text-highlighted px-4 sm:px-0 text-center sm:text-left tracking-tight" style="font-weight: 350;">
          Conseiller Bourses
        </h1>

        <UChatPrompt
          v-model="input"
          :status="loading ? 'streaming' : 'ready'"
          placeholder="Décrivez votre profil et vos objectifs..."
          class="[view-transition-name:chat-prompt] [&_textarea]:!py-5 [&_textarea]:!text-lg [&_textarea]:!rounded-xl [&_textarea]:!caret-blue-600 [&_textarea]:!px-4 [&_textarea]:!leading-relaxed [&_textarea]:!font-normal [&_textarea]:!text-gray-800 dark:[&_textarea]:!text-gray-200 [&_textarea::placeholder]:!text-base [&_textarea::placeholder]:!font-normal submit-button-cursor chat-prompt-border"
          variant="subtle"
          :ui="{ 
            base: 'px-2',
            wrapper: 'border border-gray-300 dark:border-gray-600 shadow-sm'
          }"
          @submit="onSubmit"
        >
          <template #footer>
            <div class="flex-1" />
            <UChatPromptSubmit 
              color="neutral" 
              size="sm" 
              :disabled="loading"
              class="!bg-primary-600 !hover:bg-primary-700 !text-white !transition-all !duration-200 !rounded-xl !p-2.5 cursor-pointer"
            />
          </template>
        </UChatPrompt>

        <div class="flex flex-col gap-3 mt-4">
          <template v-if="suggestionsLoading">
            <div 
              v-for="i in 5" 
              :key="i" 
              class="flex items-center gap-3 animate-pulse"
              :style="{ animationDelay: `${i * 100}ms` }"
            >
              <div class="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div 
                class="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                :class="[
                  i === 1 ? 'w-64' : 
                  i === 2 ? 'w-72' : 
                  i === 3 ? 'w-56' : 
                  i === 4 ? 'w-80' : 
                  'w-60'
                ]"
              ></div>
            </div>
          </template>

          <template v-else>
            <button
              v-for="(action, index) in quickActions"
              :key="action.label"
              class="flex items-center gap-3 text-left group transition-all duration-200 hover:translate-x-1 cursor-pointer opacity-0 animate-fade-in-up"
              :style="{ animationDelay: `${index * 50}ms` }"
              @click="createChat(action.label)"
            >
              <span class="text-gray-400 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-200 text-lg">→</span>
              <span class="text-gray-900 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 text-sm sm:text-base font-normal tracking-wide">
                {{ action.label }}
              </span>
            </button>
          </template>
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>

  <UModal v-model:open="showLoginModal">
    <template #content>
      <div class="relative">
        <button
          class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 cursor-pointer"
          @click="showLoginModal = false"
        >
          <UIcon name="i-lucide-x" class="w-4 h-4" />
        </button>

        <div class="p-8">
          <div class="text-center mb-8">
            <img 
              src="~/assets/logo/logo.png" 
              alt="EduAI" 
              class="mx-auto h-16 w-auto mb-5"
            />
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-1.5 tracking-tight">
              Bienvenue
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Connectez-vous pour continuer
            </p>
          </div>

          <div class="space-y-3">
            <a href="/auth/google" class="block w-full">
              <button
                type="button"
                class="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm cursor-pointer"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google</span>
              </button>
            </a>

            <a href="/auth/github" class="block w-full">
              <button
                type="button"
                class="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm cursor-pointer"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                </svg>
                <span>GitHub</span>
              </button>
            </a>
          </div>

          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="px-4 bg-white dark:bg-gray-900 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                ou
              </span>
            </div>
          </div>

          <div class="space-y-4">
            <NuxtLink to="/login" @click="showLoginModal = false" class="block w-full">
              <button
                type="button"
                class="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 shadow-sm shadow-primary-500/20 hover:shadow-md hover:shadow-primary-500/30 cursor-pointer"
              >
                <UIcon name="i-lucide-mail" class="w-5 h-5" />
                Email
              </button>
            </NuxtLink>

            <p class="text-center text-sm text-gray-500 dark:text-gray-400">
              Nouveau ici ? 
              <NuxtLink to="/register" class="font-medium text-primary-600 dark:text-primary-400 hover:underline underline-offset-2 cursor-pointer" @click="showLoginModal = false">
                Créer un compte
              </NuxtLink>
            </p>
          </div>

          <p class="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
            En continuant, vous acceptez nos 
            <a href="#" class="hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-2 cursor-pointer">Conditions</a> 
            et notre 
            <a href="#" class="hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-2 cursor-pointer">Confidentialité</a>
          </p>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.submit-button-cursor :deep(.u-chat-prompt-submit),
.submit-button-cursor :deep(button[type="submit"]),
:deep(.u-chat-prompt-submit),
:deep(button[type="submit"]) {
  cursor: pointer !important;
}

button,
[role="button"],
.cursor-pointer {
  cursor: pointer !important;
}

:deep(.u-chat-prompt-submit:hover) {
  cursor: pointer !important;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out forwards;
}

.chat-prompt-border :deep(.u-chat-prompt) {
  border-width: 1.5px !important;
  border-color: #d1d5db !important;
}

.dark .chat-prompt-border :deep(.u-chat-prompt) {
  border-color: #4b5563 !important;
}

:deep(.u-chat-prompt) {
  border-width: 1.5px !important;
  border-color: #d1d5db !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
}

.dark :deep(.u-chat-prompt) {
  border-color: #4b5563 !important;
}
</style>