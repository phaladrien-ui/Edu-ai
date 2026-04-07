<template>
  <div class="min-h-screen bg-background">
    <!-- Header pleine largeur -->
    <div class="border-b w-full">
      <div class="px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div class="flex items-center gap-4">
          <NuxtLink to="/courses" class="text-muted-foreground hover:text-foreground">
            <UIcon name="i-lucide-arrow-left" class="w-5 h-5" />
          </NuxtLink>
          <div>
            <h1 class="text-3xl font-bold text-foreground">Mathématiques</h1>
            <p class="text-muted-foreground mt-1">Cours de niveau classe préparatoire</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres pleine largeur -->
    <div class="px-4 sm:px-6 lg:px-8 py-6 w-full">
      <div class="flex flex-wrap gap-2">
        <button class="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
          Tous
        </button>
        <button class="px-4 py-2 bg-card text-foreground rounded-full text-sm font-medium hover:bg-accent">
          Algèbre
        </button>
        <button class="px-4 py-2 bg-card text-foreground rounded-full text-sm font-medium hover:bg-accent">
          Analyse
        </button>
        <button class="px-4 py-2 bg-card text-foreground rounded-full text-sm font-medium hover:bg-accent">
          Probabilités
        </button>
        <button class="px-4 py-2 bg-card text-foreground rounded-full text-sm font-medium hover:bg-accent">
          Géométrie
        </button>
      </div>
    </div>

    <!-- Grid des cours Maths pleine largeur -->
    <div class="px-4 sm:px-6 lg:px-8 py-6 w-full">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Algèbre Linéaire -->
        <NuxtLink 
          to="/courses/math/algebre-lineaire"
          class="group bg-card border rounded-xl p-6 hover:shadow-lg transition-all hover:border-primary/50"
        >
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-function-square" class="w-6 h-6 text-blue-500" />
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-lg text-foreground group-hover:text-primary">
                Algèbre Linéaire
              </h3>
              <p class="text-sm text-muted-foreground mt-1">
                Espaces vectoriels, applications linéaires, diagonalisation
              </p>
              <div class="mt-4 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-clock" class="w-4 h-4 text-muted-foreground" />
                  <span class="text-sm text-muted-foreground">18h 15m</span>
                </div>
                <span class="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                  32 leçons
                </span>
              </div>
            </div>
          </div>
        </NuxtLink>

        <!-- Équations Différentielles -->
        <div class="group bg-card border rounded-xl p-6 hover:shadow-lg transition-all opacity-70">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-sigma" class="w-6 h-6 text-purple-500" />
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-lg text-foreground">
                Équations Différentielles
              </h3>
              <p class="text-sm text-muted-foreground mt-1">
                Équations différentielles ordinaires, systèmes linéaires
              </p>
              <div class="mt-4 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-clock" class="w-4 h-4 text-muted-foreground" />
                  <span class="text-sm text-muted-foreground">14h 30m</span>
                </div>
                <span class="text-xs text-muted-foreground italic">
                  Bientôt
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Algèbre Multilinéaire -->
        <div class="group bg-card border rounded-xl p-6 hover:shadow-lg transition-all opacity-70">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-lucide-layers" class="w-6 h-6 text-green-500" />
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-lg text-foreground">
                Algèbre Multilinéaire
              </h3>
              <p class="text-sm text-muted-foreground mt-1">
                Tenseurs, produits tensoriels, algèbre extérieure
              </p>
              <div class="mt-4 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-clock" class="w-4 h-4 text-muted-foreground" />
                  <span class="text-sm text-muted-foreground">16h 00m</span>
                </div>
                <span class="text-xs text-muted-foreground italic">
                  Bientôt
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>