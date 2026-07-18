<script setup lang="ts">
import type { NewGoalInput, GoalStatus } from '~/composables/useGoals'

// If `editGoal` is passed, the form pre-fills with its values and
// submitting updates that goal instead of creating a new one.
const props = defineProps<{
  editGoal?: GoalStatus | null
}>()

const emit = defineEmits<{
  created: []
  updated: []
  cancelled: []
}>()

const { createGoal, updateGoal } = useGoals()

const isEditing = computed(() => !!props.editGoal)

function toMonthInput(dateStr: string) {
  return dateStr.slice(0, 7)
}

const name = ref(props.editGoal?.name ?? '')
const targetAmount = ref<number | null>(props.editGoal?.target_amount ?? null)
const bank = ref(props.editGoal?.bank ?? '')
const startMonth = ref(
  props.editGoal ? toMonthInput(props.editGoal.start_month) : new Date().toISOString().slice(0, 7)
)

const isSubmitting = ref(false)
const errorMessage = ref('')

function resetFields() {
  name.value = ''
  targetAmount.value = null
  bank.value = ''
  startMonth.value = new Date().toISOString().slice(0, 7)
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!name.value.trim() || !targetAmount.value || !bank.value.trim() || !startMonth.value) {
    errorMessage.value = 'Fill out every field before saving the goal.'
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

    if (isEditing.value && props.editGoal) {
      await updateGoal(props.editGoal.id, input)
      emit('updated')
    } else {
      await createGoal(input)
      resetFields()
      emit('created')
    }
  } catch (err: any) {
    errorMessage.value = err.message ?? 'Could not save the goal. Try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="card" @submit.prevent="handleSubmit">
    <h2 style="font-size: 1.2rem">{{ isEditing ? 'Edit goal' : 'Set a new goal' }}</h2>

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

    <div style="display: flex; gap: 0.6rem">
      <button class="btn" type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add goal' }}
      </button>
      <button v-if="isEditing" type="button" class="btn btn-ghost" @click="emit('cancelled')">
        Cancel
      </button>
    </div>
  </form>
</template>