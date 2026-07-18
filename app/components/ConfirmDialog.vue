<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    danger?: boolean
  }>(),
  {
    confirmLabel: 'Confirm',
    danger: false,
  }
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      style="position: fixed; inset: 0; background: rgba(43, 42, 37, 0.45); display: flex; align-items: center; justify-content: center; padding: 1.5rem; z-index: 100"
      @click.self="emit('cancel')"
    >
      <div class="card" style="max-width: 380px; width: 100%">
        <h3 style="font-size: 1.1rem">{{ title }}</h3>
        <p class="muted" style="margin: 0 0 1.4rem">{{ message }}</p>
        <div style="display: flex; gap: 0.6rem; justify-content: flex-end">
          <button class="btn btn-ghost" @click="emit('cancel')">Cancel</button>
          <button :class="danger ? 'btn btn-danger' : 'btn'" @click="emit('confirm')">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>