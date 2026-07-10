<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()

async function handleLogout() {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<template>
  <div>
    <header style="border-bottom: 1px solid var(--paper-line); background: rgba(250, 247, 240, 0.9)">
      <div class="container" style="padding: 1.1rem 1.5rem; display: flex; justify-content: space-between; align-items: center">
        <NuxtLink to="/" style="text-decoration: none; display: flex; align-items: center; gap: 0.6em">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="22" height="20" rx="2" stroke="#2f5d4f" stroke-width="1.6"/>
            <line x1="13" y1="4" x2="13" y2="22" stroke="#2f5d4f" stroke-width="1.6"/>
            <line x1="5.5" y1="8" x2="10" y2="8" stroke="#b8873a" stroke-width="1.3" stroke-linecap="round"/>
            <line x1="5.5" y1="11.5" x2="10" y2="11.5" stroke="#b8873a" stroke-width="1.3" stroke-linecap="round"/>
            <line x1="16" y1="8" x2="20.5" y2="8" stroke="#b8873a" stroke-width="1.3" stroke-linecap="round"/>
            <line x1="16" y1="11.5" x2="20.5" y2="11.5" stroke="#b8873a" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          <h1 style="font-size: 1.3rem; margin: 0">Savings Tracker</h1>
        </NuxtLink>
        <button v-if="user" class="btn btn-ghost" @click="handleLogout">Log out</button>
      </div>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
