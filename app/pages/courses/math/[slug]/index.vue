<template>
  <div class="min-h-screen bg-background">
    <!-- Header pleine largeur -->
    <div class="border-b w-full">
      <div class="px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div class="flex items-center gap-4">
          <NuxtLink to="/courses/math" class="text-muted-foreground hover:text-foreground">
            <UIcon name="i-lucide-arrow-left" class="w-5 h-5" />
          </NuxtLink>
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <UIcon name="i-lucide-function-square" class="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h1 class="text-3xl font-bold text-foreground">{{ course.title }}</h1>
                <p class="text-muted-foreground mt-1">{{ course.description }}</p>
              </div>
            </div>
          </div>
          <UButton label="Commencer" icon="i-lucide-play" />
        </div>
      </div>
    </div>

    <!-- Contenu pleine largeur -->
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar - Chapitres -->
        <div class="lg:col-span-1">
          <div class="sticky top-24">
            <div class="bg-card border rounded-xl p-6">
              <h3 class="font-semibold text-foreground mb-4">Plan du cours</h3>
              <div class="space-y-1">
                <div 
                  v-for="chapter in course.chapters"
                  :key="chapter.id"
                  class="p-3 rounded-lg hover:bg-accent cursor-pointer"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span class="text-sm font-medium text-primary">{{ chapter.number }}</span>
                      </div>
                      <div>
                        <div class="font-medium text-foreground">{{ chapter.title }}</div>
                        <div class="text-xs text-muted-foreground">{{ chapter.lessons }} leçons</div>
                      </div>
                    </div>
                    <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <!-- Stats -->
              <div class="mt-8 pt-6 border-t">
                <h4 class="font-semibold text-foreground mb-3">Progression</h4>
                <div class="space-y-4">
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-muted-foreground">Complétion</span>
                      <span class="font-medium">{{ course.progress }}%</span>
                    </div>
                    <div class="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-primary rounded-full" 
                        :style="{ width: course.progress + '%' }"
                      />
                    </div>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">Temps passé</span>
                    <span class="font-medium">{{ course.timeSpent }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main - Liste des leçons -->
        <div class="lg:col-span-2">
          <div class="space-y-4">
            <div 
              v-for="lesson in course.lessons"
              :key="lesson.id"
              @click="playLesson(lesson)"
              class="bg-card border rounded-xl p-4 hover:shadow-md cursor-pointer transition-all"
            >
              <div class="flex items-start gap-4">
                <div class="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-lucide-play" class="w-6 h-6 text-muted-foreground" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div>
                      <h3 class="font-semibold text-foreground">{{ lesson.title }}</h3>
                      <p class="text-sm text-muted-foreground mt-1">{{ lesson.description }}</p>
                    </div>
                    <span class="text-sm text-muted-foreground whitespace-nowrap ml-2">{{ lesson.duration }}</span>
                  </div>
                  <div class="mt-3 flex items-center gap-4">
                    <div class="flex items-center gap-2 text-xs text-muted-foreground">
                      <UIcon name="i-lucide-eye" class="w-4 h-4" />
                      <span>Non vue</span>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-muted-foreground">
                      <UIcon name="i-lucide-file-text" class="w-4 h-4" />
                      <span>PDF</span>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-muted-foreground">
                      <UIcon name="i-lucide-clipboard-list" class="w-4 h-4" />
                      <span>Exercices</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Player -->
    <UModal v-model="showPlayer" fullscreen>
      <!-- ... code player identique ... -->
    </UModal>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const showPlayer = ref(false)
const selectedLesson = ref<any>(null)

// Données du cours (à remplacer par vraies données)
const course = {
  id: 'algebre-lineaire',
  title: 'Algèbre Linéaire',
  description: 'Cours complet d\'algèbre linéaire niveau classe préparatoire',
  category: 'Mathématiques',
  level: 'Intermédiaire',
  duration: '18h 15m',
  professor: 'Professeur de Mathématiques',
  progress: 0,
  timeSpent: '0h 00m',
  
  chapters: [
    { id: 1, number: '01', title: 'Espaces vectoriels', lessons: 6 },
    { id: 2, number: '02', title: 'Applications linéaires', lessons: 8 },
    { id: 3, number: '03', title: 'Matrices', lessons: 7 },
    { id: 4, number: '04', title: 'Diagonalisation', lessons: 5 },
    { id: 5, number: '05', title: 'Formes bilinéaires', lessons: 6 },
  ],
  
  lessons: [
    {
      id: 1,
      chapter: 1,
      title: 'Introduction aux espaces vectoriels',
      description: 'Définition et premiers exemples d\'espaces vectoriels',
      duration: '45:20',
      youtubeId: 'TON_ID_1', // À remplacer
      completed: false
    },
    {
      id: 2,
      chapter: 1,
      title: 'Sous-espaces vectoriels',
      description: 'Caractérisation et propriétés des sous-espaces',
      duration: '52:15',
      youtubeId: 'TON_ID_2', // À remplacer
      completed: false
    },
    // ... plus de leçons
  ]
}

function playLesson(lesson: any) {
  selectedLesson.value = lesson
  showPlayer.value = true
}
</script>

<style scoped>
/* Assure que les éléments utilisent toute la largeur */
.w-full {
  width: 100% !important;
}

/* Pour la grille des leçons */
.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>