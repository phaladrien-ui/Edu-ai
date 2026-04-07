<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <div class="border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center gap-4">
          <NuxtLink :to="`/courses/math/${course.id}`" class="text-muted-foreground hover:text-foreground">
            <UIcon name="i-lucide-arrow-left" class="w-5 h-5" />
          </NuxtLink>
          <div class="flex-1 min-w-0">
            <h1 class="text-xl font-bold text-foreground truncate">{{ lesson.title }}</h1>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <NuxtLink :to="`/courses/math/${course.id}`" class="hover:text-foreground">
                {{ course.title }}
              </NuxtLink>
              <UIcon name="i-lucide-chevron-right" class="w-3 h-3" />
              <span>Chapitre {{ lesson.chapter }}</span>
            </div>
          </div>
          <UButton 
            v-if="hasNextLesson" 
            :to="`/courses/math/${course.id}/${nextLessonId}`"
            label="Leçon suivante" 
            icon="i-lucide-arrow-right"
            class="whitespace-nowrap"
          />
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Player (colspan 3) -->
        <div class="lg:col-span-3">
          <!-- Player EduAI -->
          <div class="bg-black rounded-xl overflow-hidden aspect-video">
            <iframe
              v-if="lesson.youtubeId"
              :src="`/api/youtube/player?id=${lesson.youtubeId}`"
              class="w-full h-full"
              frameborder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowfullscreen
              :title="lesson.title"
            />
            
            <!-- Overlay EduAI -->
            <div class="relative h-full">
              <div class="absolute top-4 left-4">
                <span class="text-white text-lg font-bold bg-black/40 px-3 py-1 rounded-lg">EduAI</span>
              </div>
            </div>
          </div>

          <!-- Infos leçon -->
          <div class="mt-6 bg-card border rounded-xl p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h2 class="text-2xl font-bold text-foreground">{{ lesson.title }}</h2>
                <p class="text-muted-foreground mt-2">{{ lesson.description }}</p>
                <div class="mt-4 flex items-center gap-6 text-sm">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-clock" class="w-4 h-4" />
                    <span class="text-muted-foreground">{{ lesson.duration }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UIcon name="i-lucide-calendar" class="w-4 h-4" />
                    <span class="text-muted-foreground">Ajouté le 28/12/2024</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <UButton 
                  variant="ghost" 
                  icon="i-lucide-check-circle" 
                  :class="lesson.completed ? 'text-green-500' : 'text-muted-foreground'"
                  @click="markAsCompleted"
                >
                  {{ lesson.completed ? 'Terminé' : 'Marquer comme terminé' }}
                </UButton>
              </div>
            </div>

            <!-- Notes -->
            <div class="mt-8 pt-6 border-t">
              <h3 class="font-semibold text-foreground mb-4">Notes personnelles</h3>
              <UTextarea 
                v-model="notes" 
                placeholder="Prenez des notes pendant la leçon..."
                :rows="4"
                class="w-full"
              />
              <div class="mt-3 flex justify-end">
                <UButton label="Sauvegarder" @click="saveNotes" />
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar (colspan 1) -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Chapitres -->
          <div class="bg-card border rounded-xl p-5">
            <h3 class="font-semibold text-foreground mb-3">Chapitres du cours</h3>
            <div class="space-y-2">
              <div 
                v-for="chapter in course.chapters"
                :key="chapter.id"
                class="p-3 rounded-lg hover:bg-accent cursor-pointer"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span class="text-sm font-medium text-primary">{{ chapter.number }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-sm text-foreground truncate">{{ chapter.title }}</div>
                    <div class="text-xs text-muted-foreground">{{ chapter.lessons }} leçons</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ressources -->
          <div class="bg-card border rounded-xl p-5">
            <h3 class="font-semibold text-foreground mb-3">Ressources</h3>
            <div class="space-y-3">
              <a href="#" class="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                <UIcon name="i-lucide-file-text" class="w-5 h-5 text-blue-500" />
                <span class="text-sm">PDF du cours (Algèbre Linéaire)</span>
              </a>
              <a href="#" class="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                <UIcon name="i-lucide-clipboard-list" class="w-5 h-5 text-green-500" />
                <span class="text-sm">Exercices corrigés</span>
              </a>
              <a href="#" class="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                <UIcon name="i-lucide-message-circle" class="w-5 h-5 text-primary" />
                <span class="text-sm">Poser une question à ChatMe</span>
              </a>
            </div>
          </div>

          <!-- Navigation leçons -->
          <div class="bg-card border rounded-xl p-5">
            <h3 class="font-semibold text-foreground mb-3">Navigation</h3>
            <div class="space-y-3">
              <UButton 
                v-if="hasPrevLesson"
                :to="`/courses/math/${course.id}/${prevLessonId}`"
                block
                variant="outline"
                icon="i-lucide-arrow-left"
                label="Leçon précédente"
              />
              <UButton 
                v-if="hasNextLesson"
                :to="`/courses/math/${course.id}/${nextLessonId}`"
                block
                icon="i-lucide-arrow-right"
                label="Leçon suivante"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const notes = ref('')
const course = {
  id: 'algebre-lineaire',
  title: 'Algèbre Linéaire',
  chapters: [
    { id: 1, number: '01', title: 'Espaces vectoriels', lessons: 6 },
    { id: 2, number: '02', title: 'Applications linéaires', lessons: 8 },
    { id: 3, number: '03', title: 'Matrices', lessons: 7 },
    { id: 4, number: '04', title: 'Diagonalisation', lessons: 5 },
    { id: 5, number: '05', title: 'Formes bilinéaires', lessons: 6 },
  ],
  lessons: [
    {
      id: 'intro-espaces-vectoriels',
      title: 'Introduction aux espaces vectoriels',
      description: 'Définition et premiers exemples d\'espaces vectoriels',
      duration: '45:20',
      youtubeId: 'TON_ID_1', // À remplacer
      chapter: 1,
      completed: false
    },
    {
      id: 'sous-espaces-vectoriels',
      title: 'Sous-espaces vectoriels',
      description: 'Caractérisation et propriétés des sous-espaces',
      duration: '52:15',
      youtubeId: 'TON_ID_2', // À remplacer
      chapter: 1,
      completed: false
    },
    // ... plus de leçons
  ]
}

// Trouver la leçon actuelle
const lessonSlug = Array.isArray(route.params.lesson) ? route.params.lesson[0] : route.params.lesson
const lesson = course.lessons.find(l => l.id === lessonSlug) || course.lessons[0]

// Navigation entre leçons
const lessonIndex = course.lessons.findIndex(l => l.id === lesson.id)
const hasPrevLesson = lessonIndex > 0
const hasNextLesson = lessonIndex < course.lessons.length - 1
const prevLessonId = hasPrevLesson ? course.lessons[lessonIndex - 1].id : ''
const nextLessonId = hasNextLesson ? course.lessons[lessonIndex + 1].id : ''

function markAsCompleted() {
  lesson.completed = !lesson.completed
  // Sauvegarder en base de données
}

function saveNotes() {
  // Sauvegarder les notes
  console.log('Notes sauvegardées:', notes.value)
}
</script>