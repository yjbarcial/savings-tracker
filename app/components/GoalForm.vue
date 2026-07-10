<script setup lang="ts">
import type { NewGoalInput } from '~/composables/useGoals'

const emit = defineEmits<{
  created: []
}>()

const { createGoal } = useGoals()

const name = ref('')
const targetAmount = ref<number | null>(null)
const bank = ref('')
const startMonth = ref(new Date().toISOString().slice(0, 7)) // yyyy-mm

const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''

  if (!name.value.trim() || !targetAmount.value || !bank.value.trim() || !startMonth.value) {
    errorMessage.value = 'Fill out every field before adding the goal.'
    return
  }

  isSubmitting.value = true
  try {
    const input: NewGoalInput = {
      name: name.value.trim(),
      target_amount: targetAmount.value,
      bank: bank.value.trim(),
      start_month: `${startMonth.value}-01`,
    }
    await createGoal(input)

    name.value = ''
    targetAmount.value = null
    bank.value = ''
    startMonth.value = new Date().toISOString().slice(0, 7)

    emit('created')
  } catch (err: any) {
    errorMessage.value = err.message ?? 'Could not add the goal. Try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="card" @submit.prevent="handleSubmit">
    <h2 style="font-size: 1.2rem">Set a new goal</h2>

    <div class="field">
      <label for="goal-name">Goal name</label>
      <input id="goal-name" v-model="name" type="text" placeholder="e.g. Emergency fund" />
    </div>

    <div class="field">
      <label for="goal-amount">Amount needed</label>
      <input id="goal-amount" v-model.number="targetAmount" type="number" min="1" step="0.01" placeholder="e.g. 50000" />
    </div>

    <div class="field">
      <label for="goal-bank">Bank</label>
      <input id="goal-bank" v-model="bank" type="text" placeholder="e.g. BPI" />
    </div>

    <div class="field">
      <label for="goal-month">Starting month</label>
      <input id="goal-month" v-model="startMonth" type="month" />
    </div>

    <p v-if="errorMessage" class="muted" style="color: var(--stamp-red)">{{ errorMessage }}</p>

    <button class="btn" type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Adding…' : 'Add goal' }}
    </button>
  </form>
</template>
