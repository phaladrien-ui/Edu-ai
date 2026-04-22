<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  requiresAuth: true,
})

const input = ref('')
const loading = ref(false)
const suggestionsLoading = ref(true)
const chatId = crypto.randomUUID()
const showLoginModal = ref(false)

const { model } = useModels()
const { user, loggedIn } = useUserSession()
const toast = useToast()

const {
  dropzoneRef,
  isDragging,
  files,
  isUploading,
  uploadedFiles,
  addFiles,
  removeFile,
  clearFiles
} = useFileUploadWithStatus(chatId)

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

  const parts: Array<{ type: string, text?: string, mediaType?: string, url?: string }> = [{ type: 'text', text: prompt }]  

  if (uploadedFiles.value.length > 0) {
    parts.push(...uploadedFiles.value)
  }

  const chat = await $fetch('/api/chats', {
    method: 'POST',
    body: {
      id: chatId,
      message: {
        role: 'user',
        parts
      }
    }
  })

  refreshNuxtData('chats')
  navigateTo(`/chat/${chat?.id}`)
}

async function onSubmit() {
  await createChat(input.value)
  clearFiles()
}

const quickChats = [
  { label: 'Comment fonctionne l\'électromagnétisme?', icon: 'i-logos-lightning' },
  { label: 'Quels sont les principes de la physique optique?', icon: 'i-logos-lightbulb' },
  { label: 'Comment interpréter des données statistiques?', icon: 'i-logos-bar-chart' },
  { label: 'Comment calculer des probabilités simples?', icon: 'i-logos-dice' },
  { label: 'Comment résoudre un problème en algèbre linéaire?', icon: 'i-logos-math' },
  { label: 'Quelles sont les bases de la chimie organique?', icon: 'i-logos-flask' },
  { label: 'Comment aborder l\'analyse mathématique?', icon: 'i-logos-calculator' }
]
</script>

<template>
  <UDashboardPanel id="home" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <DragDropOverlay :show="isDragging" />
      <UContainer ref="dropzoneRef" class="flex-1 flex flex-col justify-center gap-5 sm:gap-7 py-8">
        <div v-if="user" class="px-4 sm:px-0 mb-2">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Bon retour, <span class="font-medium text-gray-700 dark:text-gray-300">{{ user.name || user.email }}</span> !
          </p>
        </div>

        <h1 class="text-3xl sm:text-4xl text-highlighted px-4 sm:px-0 text-center sm:text-left tracking-tight" style="font-weight: 350;">
          Que voulez-vous apprendre aujourd'hui ?
        </h1>

        <UChatPrompt
          v-model="input"
          :status="loading ? 'streaming' : 'ready'"
          :disabled="isUploading"
          placeholder="Message ChatMe"
          class="[view-transition-name:chat-prompt] [&_textarea]:!py-5 [&_textarea]:!text-lg [&_textarea]:!rounded-xl [&_textarea]:!caret-blue-600 [&_textarea]:!px-4 [&_textarea]:!leading-relaxed [&_textarea]:!font-normal [&_textarea]:!text-gray-800 dark:[&_textarea]:!text-gray-200 [&_textarea::placeholder]:!text-base [&_textarea::placeholder]:!font-normal submit-button-cursor chat-prompt-border"
          variant="subtle"
          :ui="{ 
            base: 'px-2',
            wrapper: 'border border-gray-300 dark:border-gray-600 shadow-sm'
          }"
          @submit="onSubmit"
        >
          <template v-if="files.length > 0" #header>
            <div class="flex flex-wrap gap-2">
              <FileAvatar
                v-for="fileWithStatus in files"
                :key="fileWithStatus.id"
                :name="fileWithStatus.file.name"
                :type="fileWithStatus.file.type"
                :preview-url="fileWithStatus.previewUrl"
                :status="fileWithStatus.status"
                :error="fileWithStatus.error"
                removable
                @remove="removeFile(fileWithStatus.id)"
              />
            </div>
          </template>

          <template #footer>
            <div class="flex items-center gap-2">
              <FileUploadButton @files-selected="addFiles($event)" />
              <ModelSelect v-model="model" />
            </div>

            <UChatPromptSubmit 
              color="neutral" 
              size="sm" 
              :disabled="isUploading"
              class="!bg-blue-600 !hover:bg-blue-700 !text-white !transition-all !duration-200 !rounded-xl !p-2.5 cursor-pointer"
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
              v-for="(quickChat, index) in quickChats"
              :key="quickChat.label"
              class="flex items-center gap-3 text-left group transition-all duration-200 hover:translate-x-1 cursor-pointer opacity-0 animate-fade-in-up"
              :style="{ animationDelay: `${index * 50}ms` }"
              @click="createChat(quickChat.label)"
            >
              <span class="text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200 text-lg">→</span>
              <span class="text-gray-900 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 text-sm sm:text-base font-normal tracking-wide">
                {{ quickChat.label }}
              </span>
            </button>
          </template>
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>

  <!-- Modale premium avec logo -->
  <UModal v-model:open="showLoginModal">
    <template #content>
      <div class="relative">
        <button
          class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200"
          @click="showLoginModal = false"
        >
          <UIcon name="i-lucide-x" class="w-4 h-4" />
        </button>

        <div class="p-8">
          <!-- Logo -->
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

          <!-- OAuth -->
          <div class="space-y-3">
            <a href="/auth/google" class="block w-full">
              <UButton
                color="neutral"
                variant="outline"
                block
                size="lg"
                class="justify-center gap-3 font-normal h-12 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                as="div"
              >
                <UIcon name="i-simple-icons-google" class="w-5 h-5" />
                <span>Google</span>
              </UButton>
            </a>

            <a href="/auth/github" class="block w-full">
              <UButton
                color="neutral"
                variant="outline"
                block
                size="lg"
                class="justify-center gap-3 font-normal h-12 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                as="div"
              >
                <UIcon name="i-simple-icons-github" class="w-5 h-5" />
                <span>GitHub</span>
              </UButton>
            </a>
          </div>

          <!-- Séparateur -->
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

          <!-- Email -->
          <div class="space-y-4">
            <NuxtLink to="/login" @click="showLoginModal = false" class="block w-full">
              <UButton
                color="primary"
                block
                size="lg"
                class="justify-center font-medium h-12 rounded-xl shadow-sm shadow-primary-500/20 hover:shadow-md hover:shadow-primary-500/30 transition-all duration-200"
                as="div"
              >
                <UIcon name="i-lucide-mail" class="w-5 h-5 mr-2" />
                Email
              </UButton>
            </NuxtLink>

            <p class="text-center text-sm text-gray-500 dark:text-gray-400">
              Nouveau ici ? 
              <NuxtLink to="/register" class="font-medium text-primary-600 dark:text-primary-400 hover:underline underline-offset-2" @click="showLoginModal = false">
                Créer un compte
              </NuxtLink>
            </p>
          </div>

          <!-- Footer -->
          <p class="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
            En continuant, vous acceptez nos 
            <a href="#" class="hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-2">Conditions</a> 
            et notre 
            <a href="#" class="hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-2">Confidentialité</a>
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