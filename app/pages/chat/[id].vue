<script setup lang="ts">
import type { DefineComponent } from 'vue'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import { useClipboard } from '@vueuse/core'
import { getTextFromMessage } from '@nuxt/ui/utils/ai'
import ProseStreamPre from '../../components/prose/PreStream.vue'

const components = {
  pre: ProseStreamPre as unknown as DefineComponent
}

const route = useRoute()
const toast = useToast()
const clipboard = useClipboard()
const { model } = useModels()
const { loggedIn } = useUserSession()

const showLoginModal = ref(false)

function getFileName(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop() || 'file'
    return decodeURIComponent(filename)
  } catch {
    return 'file'
  }
}

const {
  dropzoneRef,
  isDragging,
  files,
  isUploading,
  uploadedFiles,
  addFiles,
  removeFile,
  clearFiles
} = useFileUploadWithStatus(route.params.id as string)

const { data } = await useFetch(`/api/chats/${route.params.id}`, {
  cache: 'force-cache'
})
if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
}

const input = ref('')

const chat = new Chat({
  id: data.value.id,
  messages: data.value.messages,
  transport: new DefaultChatTransport({
    api: `/api/chats/${data.value.id}`,
    body: {
      model: model.value
    }
  }),
  onData: (dataPart) => {
    if (dataPart.type === 'data-chat-title') {
      refreshNuxtData('chats')
    }
  },
  onError(error) {
    const { message } = typeof error.message === 'string' && error.message[0] === '{' ? JSON.parse(error.message) : error
    toast.add({
      description: message,
      icon: 'i-lucide-alert-circle',
      color: 'error',
      duration: 0
    })
  }
})

async function handleSubmit(e: Event) {
  e.preventDefault()
  
  if (!loggedIn.value) {
    showLoginModal.value = true
    return
  }
  
  if (input.value.trim() && !isUploading.value) {
    chat.sendMessage({
      text: input.value,
      files: uploadedFiles.value.length > 0 ? uploadedFiles.value : undefined
    })
    input.value = ''
    clearFiles()
  }
}

const copied = ref(false)

function copy(e: MouseEvent, message: UIMessage) {
  clipboard.copy(getTextFromMessage(message))

  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 2000)
}

onMounted(() => {
  if (data.value?.messages.length === 1) {
    chat.regenerate()
  }
})
</script>

<template>
  <UDashboardPanel id="chat" class="relative" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <DragDropOverlay :show="isDragging" />
      <UContainer ref="dropzoneRef" class="flex-1 flex flex-col gap-4 sm:gap-6">
        <UChatMessages
          should-auto-scroll
          :messages="chat.messages"
          :status="chat.status"
          :assistant="chat.status !== 'streaming' ? { actions: [{ label: 'Copy', icon: copied ? 'i-lucide-copy-check' : 'i-lucide-copy', onClick: copy }] } : { actions: [] }"
          :spacing-offset="160"
          class="lg:pt-(--ui-header-height) pb-4 sm:pb-6"
        >
          <template #content="{ message }">
            <template v-for="(part, index) in message.parts" :key="`${message.id}-${part.type}-${index}${'state' in part ? `-${part.state}` : ''}`">
              <Reasoning
                v-if="part.type === 'reasoning'"
                :text="part.text"
                :is-streaming="part.state !== 'done'"
              />
              <MDCCached
                v-else-if="part.type === 'text'"
                :value="part.text"
                :cache-key="`${message.id}-${index}`"
                :components="components"
                :parser-options="{ highlight: false }"
                class="*:first:mt-0 *:last:mb-0"
              />
              <ToolWeather
                v-else-if="part.type === 'tool-weather'"
                :invocation="(part as WeatherUIToolInvocation)"
              />
              <ToolChart
                v-else-if="part.type === 'tool-chart'"
                :invocation="(part as ChartUIToolInvocation)"
              />
              <FileAvatar
                v-else-if="part.type === 'file'"
                :name="getFileName(part.url)"
                :type="part.mediaType"
                :preview-url="part.url"
              />
            </template>
          </template>
        </UChatMessages>

        <UChatPrompt
          v-model="input"
          :error="chat.error"
          :disabled="isUploading"
          variant="subtle"
          class="sticky bottom-0 [view-transition-name:chat-prompt] rounded-b-none z-10"
          :ui="{ base: 'px-1.5' }"
          @submit="handleSubmit"
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
            <div class="flex items-center gap-1">
              <FileUploadButton @files-selected="addFiles($event)" />
              <ModelSelect v-model="model" />
            </div>

            <UChatPromptSubmit
              :status="chat.status"
              :disabled="isUploading"
              color="neutral"
              size="sm"
              @stop="chat.stop()"
              @reload="chat.regenerate()"
            />
          </template>
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>

  <!-- Modale de connexion améliorée -->
  <UModal v-model:open="showLoginModal">
    <template #content>
      <div class="p-6 sm:p-8 max-w-md mx-auto relative">
        <!-- Logo et en-tête -->
        <div class="text-center mb-6">
          <div class="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span class="text-white text-2xl font-bold">E</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Rejoignez EduAI
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Connectez-vous pour débloquer toutes les fonctionnalités
          </p>
        </div>

        <!-- Avantages -->
        <div class="grid grid-cols-3 gap-2 mb-6">
          <div class="text-center">
            <div class="w-8 h-8 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-1">
              <UIcon name="i-lucide-message-circle" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span class="text-xs text-gray-600 dark:text-gray-400">Chat illimité</span>
          </div>
          <div class="text-center">
            <div class="w-8 h-8 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-1">
              <UIcon name="i-lucide-history" class="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <span class="text-xs text-gray-600 dark:text-gray-400">Historique</span>
          </div>
          <div class="text-center">
            <div class="w-8 h-8 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-1">
              <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span class="text-xs text-gray-600 dark:text-gray-400">IA avancée</span>
          </div>
        </div>

        <!-- Boutons OAuth -->
        <div class="space-y-3">
          <UButton
            color="neutral"
            variant="outline"
            block
            size="lg"
            class="justify-center gap-3 font-medium"
            @click="navigateTo('/auth/google')"
          >
            <UIcon name="i-simple-icons-google" class="w-5 h-5" />
            Continuer avec Google
          </UButton>

          <UButton
            color="neutral"
            variant="outline"
            block
            size="lg"
            class="justify-center gap-3 font-medium"
            @click="navigateTo('/auth/github')"
          >
            <UIcon name="i-simple-icons-github" class="w-5 h-5" />
            Continuer avec GitHub
          </UButton>
        </div>

        <!-- Séparateur -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-3 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">ou</span>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="space-y-3">
          <UButton
            to="/login"
            color="primary"
            block
            size="lg"
            icon="i-lucide-log-in"
            class="justify-center font-medium"
          >
            Se connecter avec email
          </UButton>

          <p class="text-center text-sm text-gray-500 dark:text-gray-400">
            Pas encore de compte ?
            <NuxtLink to="/register" class="text-blue-600 dark:text-blue-400 hover:underline font-medium" @click="showLoginModal = false">
              S'inscrire gratuitement
            </NuxtLink>
          </p>
        </div>

        <!-- Fermer -->
        <button
          class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          @click="showLoginModal = false"
        >
          <UIcon name="i-lucide-x" class="w-5 h-5" />
        </button>
      </div>
    </template>
  </UModal>
</template>