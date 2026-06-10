<template>
  <div class="app">
    <header class="header">
      <router-link to="/" class="logo">Scrum Poker</router-link>
      <div class="header-controls">
        <div class="scheme-toggle" role="radiogroup" aria-label="Color scheme">
          <button
            v-for="scheme in colorSchemes"
            :key="scheme"
            type="button"
            class="scheme-btn"
            :class="{ active: colorScheme === scheme }"
            role="radio"
            :aria-checked="colorScheme === scheme"
            @click="setColorScheme(scheme)"
          >
            {{ colorSchemeLabels[scheme] }}
          </button>
        </div>
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

const {
  currentTheme,
  themes,
  themeLabels,
  setTheme,
  colorScheme,
  colorSchemes,
  colorSchemeLabels,
  setColorScheme
} = useTheme()
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
  flex-wrap: wrap;
  gap: 0.75rem;
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

.header-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.scheme-toggle {
  display: inline-flex;
  border: var(--border-w-xs) solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--color-surface);
  backdrop-filter: var(--card-backdrop);
}

.scheme-btn {
  padding: 0.4rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  border-right: var(--border-w-xs) solid var(--color-border);
  background: transparent;
  color: var(--color-text);
  transition: background 0.15s ease, color 0.15s ease;
}

.scheme-btn:last-child {
  border-right: none;
}

.scheme-btn:hover:not(.active) {
  background: var(--color-bg);
}

.scheme-btn.active {
  background: var(--color-text);
  color: var(--color-bg);
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
