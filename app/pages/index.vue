<script setup lang="ts">
// Auth redirect is handled automatically by the Supabase module
// (see redirectOptions in nuxt.config.ts).
import type { GoalStatus } from '~/composables/useGoals'

const { listGoals } = useGoals()

const goals = ref<GoalStatus[]>([])
const isLoading = ref(true)
const loadError = ref('')

async function loadGoals() {
  isLoading.value = true
  loadError.value = ''
  try {
    goals.value = await listGoals()
  } catch (err: any) {
    loadError.value = err.message ?? 'Could not load your goals.'
  } finally {
    isLoading.value = false
  }
}

const activeGoals = computed(() => goals.value.filter((g) => g.status === 'active'))
const completedGoals = computed(() => goals.value.filter((g) => g.status === 'completed'))

const totalSaved = computed(() =>
  goals.value.reduce((sum, g) => sum + Number(g.amount_saved), 0)
)

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
}

onMounted(loadGoals)
</script>

<template>
  <div class="container">
    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.5rem">
      <h2 style="margin: 0">Your goals</h2>
      <p v-if="!isLoading" class="figure muted" style="margin: 0">
        Total saved: {{ formatMoney(totalSaved) }}
      </p>
    </div>

    <div style="display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--gap)">
      <GoalForm @created="loadGoals" />

      <p v-if="isLoading" class="muted">Loading your goals…</p>
      <p v-else-if="loadError" style="color: var(--stamp-red)">{{ loadError }}</p>

      <template v-else>
        <p v-if="goals.length === 0" class="empty-state">
          No goals yet — add your first one above.
        </p>

        <div v-else style="display: flex; flex-direction: column; gap: 1rem">
          <GoalCard v-for="goal in activeGoals" :key="goal.id" :goal="goal" />
          <GoalCard v-for="goal in completedGoals" :key="goal.id" :goal="goal" />
        </div>
      </template>
    </div>
  </div>
</template>
