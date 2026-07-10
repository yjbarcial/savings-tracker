<script setup lang="ts">
import type { GoalStatus } from '~/composables/useGoals'
import type { Deposit } from '~/composables/useDeposits'

const route = useRoute()
const router = useRouter()
const goalId = route.params.id as string

const { getGoal, updateGoalStatus, deleteGoal } = useGoals()
const { listDeposits, deleteDeposit } = useDeposits()

const goal = ref<GoalStatus | null>(null)
const deposits = ref<Deposit[]>([])
const isLoading = ref(true)
const loadError = ref('')

async function loadAll() {
  isLoading.value = true
  loadError.value = ''
  try {
    const [goalResult, depositsResult] = await Promise.all([
      getGoal(goalId),
      listDeposits(goalId),
    ])
    goal.value = goalResult
    deposits.value = depositsResult
  } catch (err: any) {
    loadError.value = err.message ?? 'Could not load this goal.'
  } finally {
    isLoading.value = false
  }
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function handleMarkComplete() {
  if (!goal.value) return
  await updateGoalStatus(goal.value.id, 'completed')
  await loadAll()
}

async function handleDeleteGoal() {
  if (!goal.value) return
  const confirmed = confirm(`Delete "${goal.value.name}"? This also removes its deposit history.`)
  if (!confirmed) return
  await deleteGoal(goal.value.id)
  router.push('/')
}

async function handleDeleteDeposit(id: string) {
  const confirmed = confirm('Remove this deposit?')
  if (!confirmed) return
  await deleteDeposit(id)
  await loadAll()
}

onMounted(loadAll)
</script>

<template>
  <div class="container">
    <NuxtLink to="/" class="muted" style="text-decoration: none">&larr; All goals</NuxtLink>

    <p v-if="isLoading" class="muted" style="margin-top: 1rem">Loading…</p>
    <p v-else-if="loadError" style="color: var(--stamp-red); margin-top: 1rem">{{ loadError }}</p>

    <template v-else-if="goal">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin: 1rem 0">
        <h2 style="margin: 0">{{ goal.name }}</h2>
        <span v-if="goal.status === 'completed'" class="stamp">Completed</span>
      </div>

      <div class="card" style="margin-bottom: var(--gap)">
        <div style="margin-bottom: 1rem">
          <div class="ledger-row">
            <span class="ledger-label">Goal amount</span>
            <span class="ledger-leader"></span>
            <span class="ledger-value figure">{{ formatMoney(goal.target_amount) }}</span>
          </div>
          <div class="ledger-row">
            <span class="ledger-label">Amount saved</span>
            <span class="ledger-leader"></span>
            <span class="ledger-value figure">{{ formatMoney(goal.amount_saved) }}</span>
          </div>
          <div class="ledger-row">
            <span class="ledger-label">Remaining</span>
            <span class="ledger-leader"></span>
            <span class="ledger-value figure">{{ formatMoney(Math.max(goal.remaining, 0)) }}</span>
          </div>
          <div class="ledger-row">
            <span class="ledger-label">Bank</span>
            <span class="ledger-leader"></span>
            <span class="ledger-value">{{ goal.bank }}</span>
          </div>
        </div>

        <ProgressBar :saved="goal.amount_saved" :target="goal.target_amount" />

        <div style="display: flex; gap: 0.6rem; margin-top: 1.2rem">
          <button
            v-if="goal.status !== 'completed'"
            class="btn btn-ghost"
            @click="handleMarkComplete"
          >
            Mark as completed
          </button>
          <button class="btn btn-danger" @click="handleDeleteGoal">Delete goal</button>
        </div>
      </div>

      <DepositForm :goal-id="goal.id" @added="loadAll" />

      <h3 style="margin: var(--gap) 0 0.8rem">Deposit history</h3>
      <p v-if="deposits.length === 0" class="empty-state">No deposits yet.</p>
      <div v-else style="display: flex; flex-direction: column; gap: 0.6rem">
        <div
          v-for="deposit in deposits"
          :key="deposit.id"
          class="card"
          style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem"
        >
          <div>
            <p class="figure" style="margin: 0">{{ formatMoney(deposit.amount) }}</p>
            <p class="muted" style="margin: 0">
              {{ formatDate(deposit.deposited_at) }}<span v-if="deposit.note"> · {{ deposit.note }}</span>
            </p>
          </div>
          <button class="btn-ghost btn" style="border: none; padding: 0.3em 0.6em" @click="handleDeleteDeposit(deposit.id)">
            Remove
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
