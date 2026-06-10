import { ref } from 'vue'

const themes = ['neobrutalism', 'minimalism']

const themeLabels = {
  neobrutalism: 'Neo Brutalism',
  minimalism: 'Minimalism'
}

const saved = localStorage.getItem('scrumpoker_theme')
const currentTheme = ref(themes.includes(saved) ? saved : 'neobrutalism')

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
}

// Apply on load
applyTheme(currentTheme.value)

function setTheme(theme) {
  if (themes.includes(theme)) {
    currentTheme.value = theme
    localStorage.setItem('scrumpoker_theme', theme)
    applyTheme(theme)
  }
}

export function useTheme() {
  return {
    currentTheme,
    themes,
    themeLabels,
    setTheme
  }
}
