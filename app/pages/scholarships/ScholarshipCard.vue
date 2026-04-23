<!-- app/components/scholarship/ScholarshipCard.vue -->
<template>
  <UCard class="cursor-pointer hover:shadow-lg transition-all duration-200">
    <div class="space-y-3">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ scholarship.name }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ scholarship.provider }}
          </p>
        </div>
        <UBadge v-if="showMatch && scholarship.matchScore" color="primary" variant="soft">
          {{ scholarship.matchScore }}% match
        </UBadge>
      </div>
      
      <div class="space-y-1 text-sm">
        <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <UIcon name="i-lucide-coins" class="w-4 h-4" />
          {{ scholarship.amount || 'Non spécifié' }}
        </div>
        <div v-if="scholarship.deadline" class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <UIcon name="i-lucide-calendar" class="w-4 h-4" />
          Deadline : {{ formatDate(scholarship.deadline) }}
        </div>
      </div>
      
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
  scholarship: any
  showMatch?: boolean
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
  console.log('Saved', props.scholarship.id)
}
</script>