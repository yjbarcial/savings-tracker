<script setup lang="ts">
import type { Deposit } from '~/composables/useDeposits'

const props = defineProps<{
  deposit: Deposit
}>()

const emit = defineEmits<{
  changed: []
  requestDelete: [id: string]
}>()

const { updateDeposit } = useDeposits()

const isEditing = ref(false)
const amount = ref(props.deposit.amount)
const depositedAt = ref(props.deposit.deposited_at)
const note = ref(props.deposit.note ?? '')

const isSubmitting = ref(false)
const errorMessage = ref('')

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function startEdit() {
  amount.value = props.deposit.amount
  depositedAt.value = props.deposit.deposited_at
  note.value = props.deposit.note ?? ''
  errorMessage.value = ''
  isEditing.value = true
}

async function handleSave() {
  errorMessage.value = ''
  if (!amount.value || amount.value <= 0) {
    errorMessage.value = 'Enter an amount greater than zero.'
    return
  }

  isSubmitting.value = true
  try {
    await updateDeposit(props.deposit.id, {
      amount: amount.value,
      deposited_at: depositedAt.value,
      note: note.value.trim() || undefined,
    })
    isEditing.value = false
    emit('changed')
  } catch (err: any) {
    errorMessage.value = err.message ?? 'Could not save changes. Try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="card" style="padding: 0.8rem 1rem">
    <div v-if="!isEditing" style="display: flex; justify-content: space-between; align-items: center">
      <div>
        <p class="figure" style="margin: 0">{{ formatMoney(deposit.amount) }}</p>
        <p class="muted" style="margin: 0">
          {{ formatDate(deposit.deposited_at) }}<span v-if="deposit.note"> · {{ deposit.note }}</span>
        </p>
      </div>
      <div style="display: flex; gap: 0.3rem">
        <button class="btn-ghost btn" style="border: none; padding: 0.3em 0.6em" @click="startEdit">
          Edit
        </button>
        <button
          class="btn-ghost btn"
          style="border: none; padding: 0.3em 0.6em; color: var(--stamp-red)"
          @click="emit('requestDelete', deposit.id)"
        >
          Remove
        </button>
      </div>
    </div>

    <form v-else @submit.prevent="handleSave">
      <div class="field">
        <label>Amount</label>
        <input v-model.number="amount" type="number" min="0.01" step="0.01" />
      </div>
      <div class="field">
        <label>Date</label>
        <input v-model="depositedAt" type="date" />
      </div>
      <div class="field">
        <label>Note (optional)</label>
        <input v-model="note" type="text" />
      </div>
      <p v-if="errorMessage" class="muted" style="color: var(--stamp-red)">{{ errorMessage }}</p>
      <div style="display: flex; gap: 0.5rem">
        <button class="btn" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Saving…' : 'Save' }}
        </button>
        <button class="btn btn-ghost" type="button" @click="isEditing = false">Cancel</button>
      </div>
    </form>
  </div>
</template>