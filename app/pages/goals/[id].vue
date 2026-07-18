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
const isEditingGoal = ref(false)

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

async function handleMarkComplete() {
  if (!goal.value) return
  await updateGoalStatus(goal.value.id, 'completed')
  await loadAll()
}

async function handleGoalUpdated() {
  isEditingGoal.value = false
  await loadAll()
}

// --- Delete goal, via ConfirmDialog instead of browser confirm() ---
const showDeleteGoalConfirm = ref(false)

async function confirmDeleteGoal() {
  showDeleteGoalConfirm.value = false
  if (!goal.value) return
  await deleteGoal(goal.value.id)
  router.push('/')
}

// --- Delete deposit, via ConfirmDialog instead of browser confirm() ---
const pendingDeleteDepositId = ref<string | null>(null)

function requestDeleteDeposit(id: string) {
  pendingDeleteDepositId.value = id
}

async function confirmDeleteDeposit() {
  if (!pendingDeleteDepositId.value) return
  await deleteDeposit(pendingDeleteDepositId.value)
  pendingDeleteDepositId.value = null
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

      <GoalForm
        v-if="isEditingGoal"
        :edit-goal="goal"
        style="margin-bottom: var(--gap)"
        @updated="handleGoalUpdated"
        @cancelled="isEditingGoal = false"
      />

      <div v-else class="card" style="margin-bottom: var(--gap)">
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

        <div style="display: flex; gap: 0.6rem; margin-top: 1.2rem; flex-wrap: wrap">
          <button class="btn btn-ghost" @click="isEditingGoal = true">Edit goal</button>
          <button
            v-if="goal.status !== 'completed'"
            class="btn btn-ghost"
            @click="handleMarkComplete"
          >
            Mark as completed
          </button>
          <button class="btn btn-danger" @click="showDeleteGoalConfirm = true">Delete goal</button>
        </div>
      </div>

      <DepositForm :goal-id="goal.id" @added="loadAll" />

      <h3 style="margin: var(--gap) 0 0.8rem">Deposit history</h3>
      <p v-if="deposits.length === 0" class="empty-state">No deposits yet.</p>
      <div v-else style="display: flex; flex-direction: column; gap: 0.6rem">
        <DepositRow
          v-for="deposit in deposits"
          :key="deposit.id"
          :deposit="deposit"
          @changed="loadAll"
          @request-delete="requestDeleteDeposit"
        />
      </div>
    </template>

    <ConfirmDialog
      :open="showDeleteGoalConfirm"
      title="Delete this goal?"
      :message="`Delete '${goal?.name}'? This also removes its deposit history. This can't be undone.`"
      confirm-label="Delete goal"
      danger
      @confirm="confirmDeleteGoal"
      @cancel="showDeleteGoalConfirm = false"
    />

    <ConfirmDialog
      :open="!!pendingDeleteDepositId"
      title="Remove this deposit?"
      message="This will remove the deposit and update the goal's saved total. This can't be undone."
      confirm-label="Remove"
      danger
      @confirm="confirmDeleteDeposit"
      @cancel="pendingDeleteDepositId = null"
    />
  </div>
</template>