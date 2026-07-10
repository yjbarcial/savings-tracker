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
