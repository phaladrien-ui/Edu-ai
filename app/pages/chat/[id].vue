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