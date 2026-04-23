<template>
  <UCard class="cursor-pointer hover:shadow-lg transition-all duration-200">
    <div class="space-y-3">
      <!-- En-tête -->
      <div class="flex items-start justify-between">
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ scholarship.name }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ scholarship.provider }}
          </p>
        </div>
        <UBadge v-if="scholarship.matchScore" color="primary" variant="soft">
          {{ scholarship.matchScore }}% match
        </UBadge>
      </div>

      <!-- Détails -->
      <div class="space-y-1 text-sm">
        <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
          {{ scholarship.country }}
        </div>
        <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <UIcon name="i-lucide-graduation-cap" class="w-4 h-4" />
          {{ scholarship.level }}
        </div>
        <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <UIcon name="i-lucide-coins" class="w-4 h-4" />
          {{ scholarship.amount }}
        </div>
        <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <UIcon name="i-lucide-calendar" class="w-4 h-4" />
          Deadline : {{ formatDate(scholarship.deadline) }}
        </div>
      </div>

      <!-- Actions -->
      <div class="pt-2 flex gap-2">
        <UButton color="primary" variant="soft" block @click="viewDetails">
          Voir détails
        </UButton>
        <UButton icon="i-lucide-bookmark" color="neutral" variant="ghost" @click="save" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  scholarship: {
    id: string
    name: string
    provider: string
    country: string
    field: string
    level: string
    amount: string
    deadline: string
    matchScore?: number
  }
}>()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function viewDetails() {
  navigateTo(`/scholarships/${props.scholarship.id}`)
}

function save() {
  // TODO: Sauvegarder dans les favoris
  console.log('Saved', props.scholarship.id)
}
</script>