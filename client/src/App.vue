<template>
  <div class="app">
    <header class="header">
      <router-link to="/" class="logo">Scrum Poker</router-link>
      <div class="theme-selector">
        <select :value="currentTheme" @change="setTheme($event.target.value)" class="theme-select">
          <option v-for="theme in themes" :key="theme" :value="theme">
            {{ themeLabels[theme] }}
          </option>
        </select>
      </div>
    </header>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useTheme } from './composables/useTheme.js'

const { currentTheme, themes, themeLabels, setTheme } = useTheme()
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: var(--color-primary);
  border-bottom: var(--border-w) solid var(--color-border);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
}

.logo:hover {
  text-decoration: underline;
}

.theme-select {
  padding: 0.4rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: var(--border-w-xs) solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  backdrop-filter: var(--card-backdrop);
}

.main {
  flex: 1;
  padding: 2rem;
}
</style>
