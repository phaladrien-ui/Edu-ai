<script setup lang="ts">
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import { useClipboard } from '@vueuse/core'
import { getTextFromMessage } from '@nuxt/ui/utils/ai'

const route = useRoute()
const toast = useToast()
const clipboard = useClipboard()
const { loggedIn } = useUserSession()
const showLoginModal = ref(false)

const { data } = await useFetch(`/api/scholarships/chat/${route.params.id}`, {
  cache: 'force-cache'
})

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Conversation non trouvée' })
}

const input = ref('')

const chat = new Chat({
  id: data.value.id,
  messages: data.value.messages || [],
  transport: new DefaultChatTransport({
    api: `/api/scholarships/chat/${data.value.id}`
  }),
  onError(error) {
    toast.add({
      description: error.message,
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
  
  if (input.value.trim()) {
    chat.sendMessage({ text: input.value })
    input.value = ''
  }
}

const copied = ref(false)

function copy(e: MouseEvent, message: UIMessage) {
  clipboard.copy(getTextFromMessage(message))
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// 🔥 CORRECTION : Envoyer automatiquement le premier message
onMounted(() => {
  if (data.value?.messages?.length === 1) {
    chat.regenerate()
  }
})
</script>

<template>
  <UDashboardPanel id="scholarships-chat" class="relative" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <DashboardNavbar />
    </template>

    <template #body>
      <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6">
        <UChatMessages
          should-auto-scroll
          :messages="chat.messages"
          :status="chat.status"
          :assistant="chat.status !== 'streaming' ? { actions: [{ label: 'Copy', icon: copied ? 'i-lucide-copy-check' : 'i-lucide-copy', onClick: copy }] } : { actions: [] }"
          :spacing-offset="160"
          class="lg:pt-(--ui-header-height) pb-4 sm:pb-6"
        />

        <UChatPrompt
          v-model="input"
          :error="chat.error"
          variant="subtle"
          class="sticky bottom-0 [view-transition-name:chat-prompt] rounded-b-none z-10"
          :ui="{ base: 'px-1.5' }"
          @submit="handleSubmit"
        >
          <template #footer>
            <div class="flex-1" />
            <UChatPromptSubmit
              :status="chat.status"
              color="neutral"
              size="sm"
              @stop="chat.stop()"
            />
          </template>
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>

  <UModal v-model:open="showLoginModal">
    <template #content>
      <div class="p-6 text-center">
        <div class="mx-auto w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
          <UIcon name="i-lucide-log-in" class="w-7 h-7 text-primary-600" />
        </div>
        <h3 class="text-xl font-semibold mb-2">Connexion requise</h3>
        <p class="text-gray-500 mb-6">Connectez-vous pour continuer</p>
        <div class="flex gap-3 justify-center">
          <UButton color="neutral" variant="ghost" @click="showLoginModal = false">Annuler</UButton>
          <UButton color="primary" to="/login">Se connecter</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>