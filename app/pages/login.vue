<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()

const email = ref('')
const isSubmitting = ref(false)
const wasSent = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  if (!email.value.trim()) {
    errorMessage.value = 'Enter your email.'
    return
  }

  isSubmitting.value = true
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`,
      },
    })
    if (error) throw error
    wasSent.value = true
  } catch (err: any) {
    errorMessage.value = err.message ?? 'Could not send the link. Try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="container" style="max-width: 420px">
    <div style="display: flex; justify-content: center; margin-bottom: 0.6rem">
      <svg width="34" height="34" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="22" height="20" rx="2" stroke="#2f5d4f" stroke-width="1.6"/>
        <line x1="13" y1="4" x2="13" y2="22" stroke="#2f5d4f" stroke-width="1.6"/>
        <line x1="5.5" y1="8" x2="10" y2="8" stroke="#b8873a" stroke-width="1.3" stroke-linecap="round"/>
        <line x1="5.5" y1="11.5" x2="10" y2="11.5" stroke="#b8873a" stroke-width="1.3" stroke-linecap="round"/>
        <line x1="16" y1="8" x2="20.5" y2="8" stroke="#b8873a" stroke-width="1.3" stroke-linecap="round"/>
        <line x1="16" y1="11.5" x2="20.5" y2="11.5" stroke="#b8873a" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
    </div>
    <h1 style="text-align: center; margin-bottom: 0.2em">Savings Tracker</h1>
    <p class="muted" style="text-align: center; margin-bottom: 2rem">
      Sign in with a magic link — no password to remember.
    </p>

    <form v-if="!wasSent" class="card" @submit.prevent="handleSubmit">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" placeholder="you@example.com" autofocus />
      </div>

      <p v-if="errorMessage" class="muted" style="color: var(--stamp-red)">{{ errorMessage }}</p>

      <button class="btn" type="submit" style="width: 100%; justify-content: center" :disabled="isSubmitting">
        {{ isSubmitting ? 'Sending…' : 'Send magic link' }}
      </button>
    </form>

    <div v-else class="card" style="text-align: center">
      <p>Check <strong>{{ email }}</strong> for a sign-in link.</p>
    </div>
  </div>
</template>
