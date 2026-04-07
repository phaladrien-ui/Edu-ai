<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

useSeoMeta({
  title: 'Page non trouvée - EduAI',
  description: 'Cette page semble introuvable. Retournez à votre dashboard EduAI pour continuer votre apprentissage.'
})

useHead({
  htmlAttrs: {
    lang: 'fr'
  }
})
</script>

<template>
  <UApp>
    <div class="eduai-error-page">
      <div class="error-container">
        <div class="error-illustration">
          <div class="eduai-logo-mark">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <!-- Logo EduAI stylisé -->
              <circle cx="60" cy="60" r="55" fill="#3B82F6" fill-opacity="0.1"/>
              <path d="M60 30L75 50H45L60 30Z" fill="#3B82F6"/>
              <path d="M45 50V70L60 90L75 70V50L60 70L45 50Z" fill="#3B82F6" fill-opacity="0.7"/>
              <path d="M60 90L75 70H45L60 90Z" fill="#3B82F6"/>
              
              <!-- Éléments éducatifs -->
              <circle cx="60" cy="60" r="25" stroke="#10B981" stroke-width="2" stroke-dasharray="4 4"/>
              <path d="M40 45H80M40 60H80M40 75H80" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>

        <div class="error-content">
          <h1 class="error-title">
            Page en cours de construction 🚧
          </h1>
          
          <p class="error-description">
            Notre équipe EduAI travaille à enrichir cette section pédagogique. 
            En attendant, explorez nos autres ressources d'apprentissage intelligentes.
          </p>

          <div class="error-details" v-if="error.statusCode">
            <div class="error-code">
              Code d'erreur: <strong>EDUAI-{{ error.statusCode }}</strong>
            </div>
            <div class="error-message" v-if="error.message">
              Détails: {{ error.message }}
            </div>
          </div>

          <div class="error-actions">
            <UButton 
              to="/" 
              icon="i-heroicons-home-20-solid"
              size="lg"
              color="primary"
              variant="solid"
              class="action-btn"
            >
              Tableau de bord EduAI
            </UButton>
            
            <UButton 
              to="/chats" 
              icon="i-heroicons-chat-bubble-left-right-20-solid"
              size="lg"
              variant="outline"
              class="action-btn"
            >
              Discuter avec ChatMe
            </UButton>
            
            <UButton 
              to="/docs" 
              icon="i-heroicons-book-open-20-solid"
              size="lg"
              variant="ghost"
              class="action-btn"
            >
              Documentation EduAI
            </UButton>
          </div>

          <div class="error-tip">
            <div class="tip-icon">💡</div>
            <p>
              <strong>Astuce d'apprentissage :</strong> 
              Une erreur est une opportunité d'apprendre. 
              Notre IA ChatMe peut vous aider à comprendre les concepts que vous cherchiez.
            </p>
          </div>
        </div>
      </div>
    </div>
  </UApp>
</template>

<style scoped>
.eduai-error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 2rem;
}

.error-container {
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(59, 130, 246, 0.15);
  padding: 3rem;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  align-items: center;
}

.error-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
}

.eduai-logo-mark {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.error-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  margin: 0;
}

.error-description {
  font-size: 1.125rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

.error-details {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 1rem;
  border-left: 4px solid #3B82F6;
}

.error-code {
  font-family: 'Monaco', 'Courier New', monospace;
  color: #475569;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #64748b;
  font-size: 0.95rem;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.action-btn {
  flex: 1;
  min-width: 200px;
  justify-content: center;
}

.error-tip {
  background: linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%);
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 1rem;
  border: 1px solid #c7d2fe;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.tip-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.error-tip p {
  margin: 0;
  color: #4f46e5;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .error-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem;
  }
  
  .error-title {
    font-size: 2rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .action-btn {
    min-width: 100%;
  }
}
</style>