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
        <NuxtLink to="/" style="text-decoration: none">
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
