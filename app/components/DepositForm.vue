<script setup lang="ts">
const props = defineProps<{
  goalId: string
}>()

const emit = defineEmits<{
  added: []
}>()

const { addDeposit } = useDeposits()

const amount = ref<number | null>(null)
const depositedAt = ref(new Date().toISOString().slice(0, 10))
const note = ref('')

const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''

  if (!amount.value || amount.value <= 0) {
    errorMessage.value = 'Enter an amount greater than zero.'
    return
  }

  isSubmitting.value = true
  try {
    await addDeposit({
      goal_id: props.goalId,
      amount: amount.value,
      deposited_at: depositedAt.value,
      note: note.value.trim() || undefined,
    })

    amount.value = null
    note.value = ''
    depositedAt.value = new Date().toISOString().slice(0, 10)

    emit('added')
  } catch (err: any) {
    errorMessage.value = err.message ?? 'Could not save the deposit. Try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="card" @submit.prevent="handleSubmit">
    <h2 style="font-size: 1.1rem">Add a deposit</h2>

    <div class="field">
      <label for="deposit-amount">Amount</label>
      <input id="deposit-amount" v-model.number="amount" type="number" min="0.01" step="0.01" placeholder="e.g. 2000" />
    </div>

    <div class="field">
      <label for="deposit-date">Date</label>
      <input id="deposit-date" v-model="depositedAt" type="date" />
    </div>

    <div class="field">
      <label for="deposit-note">Note (optional)</label>
      <input id="deposit-note" v-model="note" type="text" placeholder="e.g. Mid-month savings" />
    </div>

    <p v-if="errorMessage" class="muted" style="color: var(--stamp-red)">{{ errorMessage }}</p>

    <button class="btn" type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Saving…' : 'Add deposit' }}
    </button>
  </form>
</template>
