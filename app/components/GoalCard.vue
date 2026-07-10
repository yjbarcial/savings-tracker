<script setup lang="ts">
import type { GoalStatus } from '~/composables/useGoals'

const props = defineProps<{
  goal: GoalStatus
}>()

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
}

function formatMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
</script>

<template>
  <NuxtLink :to="`/goals/${goal.id}`" class="card" style="display: block; text-decoration: none; color: inherit">
    <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 1em">
      <h3 style="font-size: 1.1rem">{{ goal.name }}</h3>
      <span v-if="goal.status === 'completed'" class="stamp">Completed</span>
    </div>

    <p class="muted" style="margin: 0 0 0.8em">
      {{ goal.bank }} · since {{ formatMonth(goal.start_month) }}
    </p>

    <ProgressBar :saved="goal.amount_saved" :target="goal.target_amount" />

    <p class="figure" style="margin: 0.6em 0 0; font-size: 0.95rem">
      {{ formatMoney(goal.amount_saved) }} / {{ formatMoney(goal.target_amount) }}
    </p>
  </NuxtLink>
</template>
