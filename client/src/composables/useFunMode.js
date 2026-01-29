import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

export function useFunMode(wsComposable) {
  const {
    userId,
    funModeActive,
    funModeStartedBy,
    funModeState,
    funModeEnded,
    funStart,
    funInput,
    funRestart,
    funExit
  } = wsComposable

  // Local input state
  const inputState = ref({
    up: false,
    down: false,
    left: false,
    right: false,
    shooting: false
  })

  // Track last sent input to avoid unnecessary messages
  let lastSentInput = null

  // Key mappings
  const keyMap = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ' ': 'shooting',
    w: 'up',
    W: 'up',
    s: 'down',
    S: 'down',
    a: 'left',
    A: 'left',
    d: 'right',
    D: 'right'
  }

  // Computed values
  const isStarter = computed(() => {
    return funModeStartedBy.value === userId.value
  })

  const myPlayer = computed(() => {
    if (!funModeState.value?.players || !userId.value) return null
    return funModeState.value.players.find(p => p.id === userId.value)
  })

  const players = computed(() => {
    return funModeState.value?.players || []
  })

  const bullets = computed(() => {
    return funModeState.value?.bullets || []
  })

  const hitEvents = computed(() => {
    return funModeState.value?.hitEvents || []
  })

  const gameOver = computed(() => {
    return funModeEnded.value !== null
  })

  const rankings = computed(() => {
    return funModeEnded.value?.rankings || []
  })

  // Input handlers
  function handleKeyDown(e) {
    if (!funModeActive.value) return

    const action = keyMap[e.key]
    if (action && !inputState.value[action]) {
      e.preventDefault()
      inputState.value[action] = true
      sendInput()
    }
  }

  function handleKeyUp(e) {
    if (!funModeActive.value) return

    const action = keyMap[e.key]
    if (action && inputState.value[action]) {
      e.preventDefault()
      inputState.value[action] = false
      sendInput()
    }
  }

  function sendInput() {
    const current = JSON.stringify(inputState.value)
    if (current !== lastSentInput) {
      lastSentInput = current
      funInput({ ...inputState.value })
    }
  }

  // Reset input when game ends or stops
  function resetInput() {
    inputState.value = {
      up: false,
      down: false,
      left: false,
      right: false,
      shooting: false
    }
    lastSentInput = null
  }

  // Watch for game state changes
  watch(funModeActive, (active) => {
    if (!active) {
      resetInput()
    }
  })

  watch(funModeEnded, (ended) => {
    if (ended) {
      resetInput()
    }
  })

  // Setup and cleanup keyboard listeners
  function setupListeners() {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  }

  function cleanupListeners() {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    resetInput()
  }

  // Actions
  function startFunMode() {
    funStart()
  }

  function restartGame() {
    if (isStarter.value) {
      funRestart()
    }
  }

  function exitFunMode() {
    if (isStarter.value) {
      funExit()
    }
  }

  return {
    // State
    funModeActive,
    funModeStartedBy,
    funModeState,
    funModeEnded,
    isStarter,
    myPlayer,
    players,
    bullets,
    hitEvents,
    gameOver,
    rankings,
    inputState,

    // Actions
    startFunMode,
    restartGame,
    exitFunMode,

    // Lifecycle
    setupListeners,
    cleanupListeners
  }
}
