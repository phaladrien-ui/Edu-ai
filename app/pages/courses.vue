<template>
  <div class="min-h-screen bg-background">
    <!-- Conteneur principal qui prend toute la largeur -->
    <div class="w-full">
      
      <!-- Section Hero pleine largeur -->
      <section class="w-full bg-gradient-to-b from-primary/5 to-background py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Découvrez des cours pour accélérer votre apprentissage
          </h1>
          <p class="text-lg text-muted-foreground max-w-3xl mx-auto">
            Formations de niveau classe préparatoire avec vidéos HD et assistance IA
          </p>
        </div>
      </section>

      <!-- Barre de recherche pleine largeur -->
      <section class="w-full border-y py-8">
        <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="relative">
            <UIcon 
              name="i-lucide-search" 
              class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" 
            />
            <input 
              type="search" 
              placeholder="Rechercher un cours, une leçon..." 
              class="w-full pl-12 pr-4 py-3 bg-card border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      <!-- Sections des cours - pleine largeur -->
      <main class="w-full py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <!-- Section Mathématiques -->
          <section class="w-full">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-3xl font-bold text-foreground">Mathématiques</h2>
              <NuxtLink 
                to="/courses/math" 
                class="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Voir plus →
              </NuxtLink>
            </div>

            <!-- Grille des cartes Mathématiques qui prend toute la largeur -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <!-- Carte Algèbre Linéaire -->
              <div 
                @click="openCourse('algebre-lineaire')"
                class="bg-card border rounded-xl overflow-hidden hover:shadow-lg cursor-pointer transition-all duration-300 h-full"
              >
                <div class="aspect-video bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center">
                  <UIcon name="i-lucide-function-square" class="w-16 h-16 text-blue-500" />
                </div>
                <div class="p-5">
                  <h3 class="font-bold text-lg text-foreground mb-2">Algèbre Linéaire</h3>
                  <p class="text-sm text-muted-foreground mb-4">Espaces vectoriels, applications linéaires, diagonalisation</p>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">32 leçons</span>
                    <span class="font-medium">18h 15m</span>
                  </div>
                </div>
              </div>

              <!-- Carte Probabilités -->
              <div 
                @click="openCourse('probabilites')"
                class="bg-card border rounded-xl overflow-hidden hover:shadow-lg cursor-pointer transition-all duration-300 h-full"
              >
                <div class="aspect-video bg-gradient-to-br from-purple-500/10 to-purple-600/10 flex items-center justify-center">
                  <UIcon name="i-lucide-chart-bar" class="w-16 h-16 text-purple-500" />
                </div>
                <div class="p-5">
                  <h3 class="font-bold text-lg text-foreground mb-2">Probabilités</h3>
                  <p class="text-sm text-muted-foreground mb-4">Théorie des probabilités, variables aléatoires</p>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">24 leçons</span>
                    <span class="font-medium">12h 30m</span>
                  </div>
                </div>
              </div>

              <!-- Carte Équations Différentielles -->
              <div 
                @click="openCourse('equations-differentielles')"
                class="bg-card border rounded-xl overflow-hidden hover:shadow-lg cursor-pointer transition-all duration-300 h-full"
              >
                <div class="aspect-video bg-gradient-to-br from-green-500/10 to-green-600/10 flex items-center justify-center">
                  <UIcon name="i-lucide-sigma" class="w-16 h-16 text-green-500" />
                </div>
                <div class="p-5">
                  <h3 class="font-bold text-lg text-foreground mb-2">Équations Différentielles</h3>
                  <p class="text-sm text-muted-foreground mb-4">Équations différentielles ordinaires et systèmes</p>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">28 leçons</span>
                    <span class="font-medium">14h 30m</span>
                  </div>
                </div>
              </div>

              <!-- Carte Algèbre Multilinéaire -->
              <div 
                @click="openCourse('algebre-multilineaire')"
                class="bg-card border rounded-xl overflow-hidden hover:shadow-lg cursor-pointer transition-all duration-300 h-full"
              >
                <div class="aspect-video bg-gradient-to-br from-orange-500/10 to-orange-600/10 flex items-center justify-center">
                  <UIcon name="i-lucide-layers" class="w-16 h-16 text-orange-500" />
                </div>
                <div class="p-5">
                  <h3 class="font-bold text-lg text-foreground mb-2">Algèbre Multilinéaire</h3>
                  <p class="text-sm text-muted-foreground mb-4">Tenseurs, produits tensoriels, algèbre extérieure</p>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">20 leçons</span>
                    <span class="font-medium">16h 00m</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section Physique (bientôt disponible) -->
          <section class="w-full">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-3xl font-bold text-foreground">Physique</h2>
              <span class="text-sm text-muted-foreground italic">
                Bientôt disponible
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <!-- Carte Électromagnétisme -->
              <div class="bg-card border rounded-xl overflow-hidden opacity-70 h-full">
                <div class="aspect-video bg-gradient-to-br from-red-500/10 to-red-600/10 flex items-center justify-center">
                  <UIcon name="i-lucide-atom" class="w-16 h-16 text-red-500" />
                </div>
                <div class="p-5">
                  <h3 class="font-bold text-lg text-foreground mb-2">Électromagnétisme</h3>
                  <p class="text-sm text-muted-foreground mb-4">Équations de Maxwell, ondes électromagnétiques</p>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">30 leçons</span>
                    <span class="font-medium">15h 45m</span>
                  </div>
                </div>
              </div>

              <!-- Carte Optique Physique -->
              <div class="bg-card border rounded-xl overflow-hidden opacity-70 h-full">
                <div class="aspect-video bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 flex items-center justify-center">
                  <UIcon name="i-lucide-eye" class="w-16 h-16 text-yellow-500" />
                </div>
                <div class="p-5">
                  <h3 class="font-bold text-lg text-foreground mb-2">Optique Physique</h3>
                  <p class="text-sm text-muted-foreground mb-4">Interférences, diffraction, polarisation</p>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">22 leçons</span>
                    <span class="font-medium">11h 20m</span>
                  </div>
                </div>
              </div>

              <!-- Carte Mécanique Avancée -->
              <div class="bg-card border rounded-xl overflow-hidden opacity-70 h-full">
                <div class="aspect-video bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 flex items-center justify-center">
                  <UIcon name="i-lucide-wind" class="w-16 h-16 text-indigo-500" />
                </div>
                <div class="p-5">
                  <h3 class="font-bold text-lg text-foreground mb-2">Mécanique Avancée</h3>
                  <p class="text-sm text-muted-foreground mb-4">Mécanique analytique, théorie des champs</p>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">26 leçons</span>
                    <span class="font-medium">13h 40m</span>
                  </div>
                </div>
              </div>

              <!-- Carte Thermodynamique -->
              <div class="bg-card border rounded-xl overflow-hidden opacity-70 h-full">
                <div class="aspect-video bg-gradient-to-br from-pink-500/10 to-pink-600/10 flex items-center justify-center">
                  <UIcon name="i-lucide-thermometer" class="w-16 h-16 text-pink-500" />
                </div>
                <div class="p-5">
                  <h3 class="font-bold text-lg text-foreground mb-2">Thermodynamique</h3>
                  <p class="text-sm text-muted-foreground mb-4">Lois de la thermodynamique, cycles thermodynamiques</p>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">18 leçons</span>
                    <span class="font-medium">9h 30m</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section Chimie (bientôt disponible) -->
          <section class="w-full">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-3xl font-bold text-foreground">Chimie</h2>
              <span class="text-sm text-muted-foreground italic">
                Bientôt disponible
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <!-- Carte Chimie Quantique -->
              <div class="bg-card border rounded-xl overflow-hidden opacity-70 h-full">
                <div class="aspect-video bg-gradient-to-br from-teal-500/10 to-teal-600/10 flex items-center justify-center">
                  <UIcon name="i-lucide-flask-conical" class="w-16 h-16 text-teal-500" />
                </div>
                <div class="p-5">
                  <h3 class="font-bold text-lg text-foreground mb-2">Chimie Quantique</h3>
                  <p class="text-sm text-muted-foreground mb-4">Structure atomique, liaisons chimiques, spectroscopie</p>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">20 leçons</span>
                    <span class="font-medium">10h 20m</span>
                  </div>
                </div>
              </div>

              <!-- Carte Chimie Organique -->
              <div class="bg-card border rounded-xl overflow-hidden opacity-70 h-full">
                <div class="aspect-video bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 flex items-center justify-center">
                  <UIcon name="i-lucide-hexagon" class="w-16 h-16 text-cyan-500" />
                </div>
                <div class="p-5">
                  <h3 class="font-bold text-lg text-foreground mb-2">Chimie Organique</h3>
                  <p class="text-sm text-muted-foreground mb-4">Molécules organiques, réactions chimiques, stéréochimie</p>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">24 leçons</span>
                    <span class="font-medium">12h 45m</span>
                  </div>
                </div>
              </div>

              <!-- Carte Chimie des Matériaux -->
              <div class="bg-card border rounded-xl overflow-hidden opacity-70 h-full">
                <div class="aspect-video bg-gradient-to-br from-rose-500/10 to-rose-600/10 flex items-center justify-center">
                  <UIcon name="i-lucide-cube" class="w-16 h-16 text-rose-500" />
                </div>
                <div class="p-5">
                  <h3 class="font-bold text-lg text-foreground mb-2">Chimie des Matériaux</h3>
                  <p class="text-sm text-muted-foreground mb-4">Solides cristallins, semi-conducteurs, nanomatériaux</p>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">16 leçons</span>
                    <span class="font-medium">8h 30m</span>
                  </div>
                </div>
              </div>

              <!-- Carte Cinétique Chimique -->
              <div class="bg-card border rounded-xl overflow-hidden opacity-70 h-full">
                <div class="aspect-video bg-gradient-to-br from-violet-500/10 to-violet-600/10 flex items-center justify-center">
                  <UIcon name="i-lucide-timer" class="w-16 h-16 text-violet-500" />
                </div>
                <div class="p-5">
                  <h3 class="font-bold text-lg text-foreground mb-2">Cinétique Chimique</h3>
                  <p class="text-sm text-muted-foreground mb-4">Vitesses de réaction, mécanismes réactionnels</p>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">14 leçons</span>
                    <span class="font-medium">7h 45m</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <!-- Footer pleine largeur -->
      <footer class="w-full border-t py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p class="text-sm text-muted-foreground">
            © 2024 EduAI - Plateforme éducative intelligente
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Fonction pour ouvrir un cours
 * @param slug - Identifiant unique du cours
 */
function openCourse(slug: string) {
  navigateTo(`/courses/math/${slug}`);
}
</script>

<style scoped>
/* Assure que tout prend la largeur disponible */
.w-full {
  width: 100% !important;
}

/* Assure le défilement */
html, body {
  overflow-y: auto !important;
  height: auto !important;
  min-height: 100vh;
}
</style>