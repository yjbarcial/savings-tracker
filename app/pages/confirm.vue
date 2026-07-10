<script setup lang="ts">
definePageMeta({ layout: false })

const user = useSupabaseUser()
const router = useRouter()

// The Supabase module handles the token exchange automatically.
// Once the user session is available, send them to the dashboard.
watch(
  user,
  (value) => {
    if (value) router.push('/')
  },
  { immediate: true }
)
</script>

<template>
  <div class="container" style="text-align: center">
    <p class="muted">Signing you in…</p>
  </div>
</template>
