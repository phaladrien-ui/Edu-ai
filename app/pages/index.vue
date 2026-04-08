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
      <UContainer ref="dropzoneRef" class="flex-1 flex flex-col justify-center gap-4 sm:gap-6 py-8">
        <h1 class="text-2xl sm:text-4xl text-highlighted font-bold px-4 sm:px-0">
          Que voulez-vous apprendre aujourd'hui ?
        </h1>

        <UChatPrompt
          v-model="input"
          :status="loading ? 'streaming' : 'ready'"
          :disabled="isUploading"
          class="[view-transition-name:chat-prompt] [&_textarea]:!py-5 [&_textarea]:!text-base [&_textarea]:!rounded-lg"
          variant="subtle"
          :ui="{ base: 'px-1.5' }"
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
            <div class="flex items-center gap-1">
              <FileUploadButton @files-selected="addFiles($event)" />
              <ModelSelect v-model="model" />
            </div>

            <UChatPromptSubmit color="neutral" size="sm" :disabled="isUploading" />
          </template>
        </UChatPrompt>

        <!-- Suggestions optimisées pour mobile -->
        <div class="flex flex-wrap gap-2 px-1">
          <UButton
            v-for="quickChat in quickChats"
            :key="quickChat.label"
            :icon="quickChat.icon"
            :label="quickChat.label"
            size="sm"
            color="neutral"
            variant="outline"
            class="rounded-full !px-3 !py-1.5 !text-sm"
            @click="createChat(quickChat.label)"
          />
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>