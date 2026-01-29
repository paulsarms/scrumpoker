<template>
  <div class="fun-mode-overlay" @keydown.prevent>
    <!-- Arena -->
    <div class="arena" ref="arenaRef">
      <!-- Stars background -->
      <div class="stars"></div>

      <!-- Players -->
      <SpaceshipCard
        v-for="player in players"
        :key="player.id"
        :id="player.id"
        :name="player.name"
        :x="player.x"
        :y="player.y"
        :rotation="player.rotation"
        :alive="player.alive"
        :invincible="player.invincible"
        :thrusting="player.thrusting"
        :isCurrent="player.id === currentUserId"
        :isHit="isPlayerHit(player.id)"
      />

      <!-- Bullets -->
      <Bullet
        v-for="bullet in bullets"
        :key="bullet.id"
        :x="bullet.x"
        :y="bullet.y"
        :rotation="bullet.rotation"
      />

      <!-- Instructions overlay (shows briefly at start) -->
      <div v-if="showInstructions" class="instructions">
        <div class="instruction-box">
          <h2 class="activation-title">Deathmatch mode activated!</h2>
          <h3>Controls</h3>
          <p><kbd>↑</kbd> <kbd>W</kbd> Forward</p>
          <p><kbd>↓</kbd> <kbd>S</kbd> Backward</p>
          <p><kbd>←</kbd> <kbd>A</kbd> Rotate Left</p>
          <p><kbd>→</kbd> <kbd>D</kbd> Rotate Right</p>
          <p><kbd>Space</kbd> Shoot</p>
        </div>
      </div>

      <!-- Game Over Podium -->
      <GamePodium
        v-if="gameOver"
        :rankings="rankings"
        :currentUserId="currentUserId"
        :isStarter="isStarter"
        :startedBy="funModeStartedBy"
        @restart="restartGame"
        @exit="exitFunMode"
      />
    </div>

    <!-- HUD -->
    <div class="hud">
      <div class="hud-left">
        <div class="players-status">
          <div
            v-for="player in sortedPlayers"
            :key="player.id"
            class="player-status"
            :class="{
              'is-current': player.id === currentUserId,
              'is-dead': !player.alive
            }"
          >
            <span class="player-name-hud">{{ player.name }}</span>
            <span class="player-lives">
              <span v-for="i in 3" :key="i" class="life-icon" :class="{ active: i <= player.lives }">●</span>
            </span>
          </div>
        </div>
      </div>
      <div class="hud-center">
        <span class="game-title">Deathmatch Mode</span>
      </div>
      <div class="hud-right">
        <button v-if="isStarter && !gameOver" class="exit-btn" @click="exitFunMode">
          Exit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import SpaceshipCard from './SpaceshipCard.vue'
import Bullet from './Bullet.vue'
import GamePodium from './GamePodium.vue'
import { useFunMode } from '../../composables/useFunMode.js'

const props = defineProps({
  wsComposable: {
    type: Object,
    required: true
  }
})

const {
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
  restartGame,
  exitFunMode,
  setupListeners,
  cleanupListeners
} = useFunMode(props.wsComposable)

const currentUserId = computed(() => props.wsComposable.userId.value)

// Sort players: current user first, then alive players, then dead players
const sortedPlayers = computed(() => {
  if (!players.value) return []
  return [...players.value].sort((a, b) => {
    // Current user first
    if (a.id === currentUserId.value) return -1
    if (b.id === currentUserId.value) return 1
    // Then alive players
    if (a.alive && !b.alive) return -1
    if (!a.alive && b.alive) return 1
    // Then by name
    return a.name.localeCompare(b.name)
  })
})

const arenaRef = ref(null)
const showInstructions = ref(true)

// Track recent hits for visual feedback
const recentHits = ref(new Set())

function isPlayerHit(playerId) {
  return recentHits.value.has(playerId)
}

// Watch for hit events
watch(hitEvents, (events) => {
  if (events && events.length > 0) {
    for (const event of events) {
      recentHits.value.add(event.playerId)
      setTimeout(() => {
        recentHits.value.delete(event.playerId)
      }, 300)
    }
  }
}, { deep: true })

// Hide instructions after a few seconds
onMounted(() => {
  setupListeners()

  setTimeout(() => {
    showInstructions.value = false
  }, 3000)
})

onUnmounted(() => {
  cleanupListeners()
})
</script>

<style scoped>
.fun-mode-overlay {
  position: fixed;
  inset: 0;
  background: #0a0a1a;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.arena {
  flex: 1;
  position: relative;
  overflow: hidden;
  margin: 60px 20px 20px;
  border: 4px solid var(--color-black);
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
  box-shadow: 8px 8px 0 var(--color-black);
}

/* Starfield background */
.stars {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(2px 2px at 20px 30px, white, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, white, transparent),
    radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 230px 80px, white, transparent),
    radial-gradient(2px 2px at 300px 150px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 350px 200px, white, transparent),
    radial-gradient(2px 2px at 420px 100px, rgba(255,255,255,0.7), transparent),
    radial-gradient(1px 1px at 500px 180px, white, transparent),
    radial-gradient(2px 2px at 550px 50px, rgba(255,255,255,0.5), transparent);
  background-size: 600px 250px;
  animation: twinkle 4s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes twinkle {
  from { opacity: 0.7; }
  to { opacity: 1; }
}

/* HUD */
.hud {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  min-height: 50px;
  background: var(--color-black);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  z-index: 1001;
  gap: 1rem;
}

.hud-left {
  flex: 1;
  min-width: 0;
}

.hud-right {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.players-status {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.player-status {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.player-status.is-current {
  border-color: var(--color-accent);
  background: rgba(0, 188, 212, 0.2);
}

.player-status.is-dead {
  opacity: 0.4;
}

.player-name-hud {
  color: white;
  font-weight: 700;
  font-size: 0.75rem;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-lives {
  display: flex;
  gap: 1px;
}

.life-icon {
  color: #444;
  font-size: 0.75rem;
}

.life-icon.active {
  color: #ff4444;
}

.hud-center {
  flex-shrink: 0;
}

.game-title {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  white-space: nowrap;
}

.exit-btn {
  padding: 0.5rem 1rem;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.875rem;
  background: var(--color-secondary);
  border: 3px solid var(--color-white);
  color: var(--color-black);
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.exit-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--color-white);
}

/* Instructions overlay */
.instructions {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  animation: fadeOut 3s forwards;
  pointer-events: none;
}

@keyframes fadeOut {
  0%, 70% { opacity: 1; }
  100% { opacity: 0; }
}

.instruction-box {
  background: var(--color-white);
  border: 4px solid var(--color-black);
  box-shadow: 6px 6px 0 var(--color-black);
  padding: 1.5rem;
  text-align: center;
}

.activation-title {
  margin: 0 0 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 2.5rem;
  background: var(--color-primary);
  border: 4px solid var(--color-black);
  box-shadow: 4px 4px 0 var(--color-black);
  animation: pulse 0.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.02);
  }
}

.instruction-box h3 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
}

.instruction-box p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
}

.instruction-box kbd {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: var(--color-black);
  color: var(--color-white);
  border-radius: 4px;
  font-family: inherit;
  font-weight: 700;
  margin-right: 0.25rem;
}
</style>
