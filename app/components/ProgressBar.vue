<script setup lang="ts">
const props = defineProps<{
  saved: number
  target: number
}>()

const percent = computed(() => {
  if (props.target <= 0) return 0
  return Math.min(100, Math.round((props.saved / props.target) * 100))
})
</script>

<template>
  <div>
    <div class="progress-track">
      <div
        class="progress-fill"
        :class="{ 'is-complete': percent >= 100 }"
        :style="{ width: percent + '%' }"
      />
    </div>
    <p class="muted" style="margin: 0.35em 0 0">{{ percent }}% saved</p>
  </div>
</template>
