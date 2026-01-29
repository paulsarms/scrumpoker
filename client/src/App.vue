<template>
  <div class="app">
    <header class="header">
      <router-link to="/" class="logo">Scrum Poker</router-link>
    </header>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: var(--color-primary);
  border-bottom: 4px solid var(--color-black);
  padding: 1rem 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-black);
  text-decoration: none;
}

.logo:hover {
  text-decoration: underline;
}

.main {
  flex: 1;
  padding: 2rem;
}
</style>
