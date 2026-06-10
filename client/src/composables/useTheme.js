import { ref } from 'vue'

/* ----- Visual style theme (Neo Brutalism / Minimalism) ----- */

const themes = ['neobrutalism', 'minimalism']

const themeLabels = {
  neobrutalism: 'Neo Brutalism',
  minimalism: 'Minimalism'
}

const savedTheme = localStorage.getItem('scrumpoker_theme')
const currentTheme = ref(themes.includes(savedTheme) ? savedTheme : 'neobrutalism')

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

/* ----- Color scheme (Light / Dark / Auto) ----- */

const colorSchemes = ['auto', 'light', 'dark']

const colorSchemeLabels = {
  auto: 'Auto',
  light: 'Light',
  dark: 'Dark'
}

const savedScheme = localStorage.getItem('scrumpoker_color_scheme')
const colorScheme = ref(colorSchemes.includes(savedScheme) ? savedScheme : 'auto')

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

// Resolve the user's choice into a concrete "light" | "dark" value.
function resolveScheme(scheme) {
  if (scheme === 'auto') {
    return darkQuery.matches ? 'dark' : 'light'
  }
  return scheme
}

function applyColorScheme(scheme) {
  document.documentElement.dataset.colorScheme = resolveScheme(scheme)
}

// Apply on load
applyColorScheme(colorScheme.value)

// Follow the system preference while in "auto" mode.
darkQuery.addEventListener('change', () => {
  if (colorScheme.value === 'auto') {
    applyColorScheme('auto')
  }
})

function setColorScheme(scheme) {
  if (colorSchemes.includes(scheme)) {
    colorScheme.value = scheme
    localStorage.setItem('scrumpoker_color_scheme', scheme)
    applyColorScheme(scheme)
  }
}

export function useTheme() {
  return {
    currentTheme,
    themes,
    themeLabels,
    setTheme,
    colorScheme,
    colorSchemes,
    colorSchemeLabels,
    setColorScheme
  }
}
