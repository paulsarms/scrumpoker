<template>
  <div
    class="spaceship"
    :class="{
      'is-current': isCurrent,
      'is-invincible': invincible,
      'is-hit': showHit,
      'is-dead': !alive
    }"
    :style="{
      left: `${x * 100}%`,
      top: `${y * 100}%`,
      transform: `translate(-50%, -50%) rotate(${rotation + Math.PI / 2}rad)`
    }"
  >
    <!-- Gun -->
    <div class="gun">
      <div v-if="shooting" class="muzzle-flash"></div>
    </div>

    <!-- Ship body (card) -->
    <div class="card-body">
      <span class="card-label">{{ displayLabel }}</span>
    </div>

    <!-- Wings -->
    <div class="wing wing-left"></div>
    <div class="wing wing-right"></div>

    <!-- Rocket boosters -->
    <div class="boosters">
      <div class="booster booster-left">
        <div v-if="thrusting" class="flame"></div>
      </div>
      <div class="booster booster-right">
        <div v-if="thrusting" class="flame"></div>
      </div>
    </div>

    <!-- Player name (below ship, counter-rotated) -->
    <div class="player-name" :style="{ transform: `rotate(${-(rotation + Math.PI / 2)}rad)` }">
      {{ name }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  rotation: {
    type: Number,
    required: true
  },
  alive: {
    type: Boolean,
    required: true
  },
  invincible: {
    type: Boolean,
    default: false
  },
  thrusting: {
    type: Boolean,
    default: false
  },
  shooting: {
    type: Boolean,
    default: false
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  isHit: {
    type: Boolean,
    default: false
  }
})

const showHit = ref(false)
let hitTimeout = null

// Display first letter or number for the card
const displayLabel = computed(() => {
  const name = props.name.trim()
  if (!name) return '?'
  // If starts with number, show the number
  if (/^\d/.test(name)) {
    return name.charAt(0)
  }
  // Otherwise show first letter uppercase
  return name.charAt(0).toUpperCase()
})

// Flash effect when hit
watch(() => props.isHit, (hit) => {
  if (hit) {
    showHit.value = true
    if (hitTimeout) clearTimeout(hitTimeout)
    hitTimeout = setTimeout(() => {
      showHit.value = false
    }, 300)
  }
})
</script>

<style scoped>
.spaceship {
  position: absolute;
  width: 32px;
  height: 58px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: opacity 0.3s;
  pointer-events: none;
}

.spaceship.is-dead {
  opacity: 0.3;
}

.spaceship.is-invincible {
  animation: pulse 0.2s ease-in-out infinite;
}

.spaceship.is-hit .card-body {
  background: #ff4444 !important;
}

.spaceship.is-current .card-body {
  border-color: var(--color-accent);
  box-shadow: 0 0 12px rgba(0, 188, 212, 0.6);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Gun */
.gun {
  width: 6px;
  height: 10px;
  background: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 2px;
  position: relative;
  z-index: 2;
}

.muzzle-flash {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 12px;
  background: radial-gradient(ellipse at center bottom, #ffffff, #ffcc00, #ff6b35, transparent);
  border-radius: 50% 50% 30% 30%;
  animation: muzzle-flicker 0.05s ease-out infinite alternate;
}

@keyframes muzzle-flicker {
  from {
    opacity: 0.9;
    transform: translateX(-50%) scale(1);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1.1);
  }
}

/* Card body */
.card-body {
  width: 32px;
  height: 45px;
  background: var(--color-white);
  border: 3px solid var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  margin-top: -3px;
}

.card-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-black);
}

/* Wings */
.wing {
  position: absolute;
  width: 13px;
  height: 6px;
  background: var(--color-primary);
  border: 2px solid var(--color-black);
  top: 26px;
  z-index: 0;
}

.wing-left {
  left: -10px;
  transform: skewY(-10deg);
}

.wing-right {
  right: -10px;
  transform: skewY(10deg);
}

/* Boosters */
.boosters {
  display: flex;
  gap: 8px;
  margin-top: -3px;
  z-index: 1;
}

.booster {
  width: 6px;
  height: 9px;
  background: var(--color-black);
  border-radius: 0 0 2px 2px;
  position: relative;
}

.flame {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 13px;
  background: linear-gradient(to bottom, #ff6b35, #ffcc00, transparent);
  border-radius: 0 0 50% 50%;
  animation: flicker 0.1s ease-in-out infinite alternate;
}

@keyframes flicker {
  from {
    height: 12px;
    opacity: 0.9;
  }
  to {
    height: 16px;
    opacity: 1;
  }
}

/* Player name */
.player-name {
  position: absolute;
  bottom: -16px;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-white);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
