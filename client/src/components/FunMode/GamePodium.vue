<template>
  <div class="podium-overlay">
    <div class="podium-container">
      <h2 class="podium-title">Game Over!</h2>

      <div class="rankings">
        <div
          v-for="(player, index) in rankings"
          :key="player.id"
          class="ranking-row"
          :class="{
            'rank-1': player.rank === 1,
            'rank-2': player.rank === 2,
            'rank-3': player.rank === 3,
            'is-current': player.id === currentUserId
          }"
        >
          <span class="rank-badge">{{ getRankEmoji(player.rank) }}</span>
          <span class="rank-number">#{{ player.rank }}</span>
          <span class="player-name">{{ player.name }}</span>
          <span v-if="player.survived" class="status survived">Winner!</span>
          <span v-else class="status eliminated">{{ getEliminationText(player) }}</span>
        </div>
      </div>

      <div class="podium-actions">
        <button v-if="isStarter" class="action-btn restart-btn" @click="$emit('restart')">
          Play Again
        </button>
        <button v-if="isStarter" class="action-btn exit-btn" @click="$emit('exit')">
          Exit Fun Mode
        </button>
        <p v-if="!isStarter" class="waiting-text">
          Waiting for {{ starterName }} to restart or exit...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rankings: {
    type: Array,
    required: true
  },
  currentUserId: {
    type: String,
    required: true
  },
  isStarter: {
    type: Boolean,
    required: true
  },
  startedBy: {
    type: String,
    required: true
  }
})

defineEmits(['restart', 'exit'])

const starterName = computed(() => {
  const starter = props.rankings.find(r => r.id === props.startedBy)
  return starter?.name || 'the host'
})

function getRankEmoji(rank) {
  switch (rank) {
    case 1: return '🥇'
    case 2: return '🥈'
    case 3: return '🥉'
    default: return '💀'
  }
}

function getEliminationText(player) {
  if (player.reason === 'disconnect') {
    return 'Disconnected'
  }
  return 'Eliminated'
}
</script>

<style scoped>
.podium-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.podium-container {
  background: var(--color-white);
  border: 4px solid var(--color-black);
  box-shadow: 8px 8px 0 var(--color-black);
  padding: 2rem;
  max-width: 400px;
  width: 90%;
}

.podium-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--color-black);
}

.rankings {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.ranking-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 3px solid var(--color-black);
  background: var(--color-white);
}

.ranking-row.rank-1 {
  background: var(--color-primary);
}

.ranking-row.rank-2 {
  background: #e0e0e0;
}

.ranking-row.rank-3 {
  background: #cd7f32;
  color: white;
}

.ranking-row.is-current {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent);
}

.rank-badge {
  font-size: 1.5rem;
}

.rank-number {
  font-weight: 700;
  min-width: 30px;
}

.player-name {
  flex: 1;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border: 2px solid var(--color-black);
}

.status.survived {
  background: var(--color-accent);
}

.status.eliminated {
  background: var(--color-secondary);
}

.podium-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-family: inherit;
  font-weight: 700;
  font-size: 1rem;
  border: 3px solid var(--color-black);
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.action-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--color-black);
}

.restart-btn {
  background: var(--color-accent);
}

.exit-btn {
  background: var(--color-secondary);
}

.waiting-text {
  text-align: center;
  font-weight: 700;
  color: var(--color-black);
  margin: 0;
}
</style>
