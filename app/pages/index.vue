<script setup lang="ts">
const input = ref('')
const loading = ref(false)
const chatId = crypto.randomUUID()

const { model } = useModels()

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

async function createChat(prompt: string) {
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
  {
    label: 'Comment fonctionne l\'électromagnétisme?',
    icon: 'i-logos-lightning'
  },
  {
    label: 'Quels sont les principes de la physique optique?',
    icon: 'i-logos-lightbulb'
  },
  {
    label: 'Comment interpréter des données statistiques?',
    icon: 'i-logos-bar-chart'
  },
  {
    label: 'Comment calculer des probabilités simples?',
    icon: 'i-logos-dice'
  },
  {
    label: 'Comment résoudre un problème en algèbre linéaire?',
    icon: 'i-logos-math'
  },
  {
    label: 'Quelles sont les bases de la chimie organique?',
    icon: 'i-logos-flask'
  },
  {
    label: 'Comment aborder l\'analyse mathématique?',
    icon: 'i-logos-calculator'
  }
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
        <h1 class="text-3xl sm:text-4xl text-highlighted !font-light px-4 sm:px-0 text-center sm:text-left tracking-tight">
          Que voulez-vous apprendre aujourd'hui ?
        </h1>

        <UChatPrompt
          v-model="input"
          :status="loading ? 'streaming' : 'ready'"
          :disabled="isUploading"
          placeholder="Message ChatMe"
          class="[view-transition-name:chat-prompt] [&_textarea]:!py-5 [&_textarea]:!text-lg [&_textarea]:!rounded-xl [&_textarea]:!caret-blue-600 [&_textarea]:!px-4 [&_textarea]:!leading-relaxed [&_textarea]:!font-normal [&_textarea]:!text-gray-800 dark:[&_textarea]:!text-gray-200 [&_textarea::placeholder]:!text-base [&_textarea::placeholder]:!font-normal"
          variant="subtle"
          :ui="{ base: 'px-2' }"
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
              class="!bg-blue-600 !hover:bg-blue-700 !text-white !transition-all !duration-200 !rounded-xl !p-2.5"
            />
          </template>
        </UChatPrompt>

        <div class="flex flex-col gap-3 mt-4">
          <button
            v-for="quickChat in quickChats"
            :key="quickChat.label"
            class="flex items-center gap-3 text-left group transition-all duration-200 hover:translate-x-1 cursor-pointer"
            @click="createChat(quickChat.label)"
          >
            <span class="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors duration-200 text-lg">→</span>
            <span class="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 text-sm sm:text-base font-normal tracking-wide">
              {{ quickChat.label }}
            </span>
          </button>
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>