<template>
  <div class="room-controls">
    <button
      v-if="!revealed"
      class="btn btn-reveal"
      @click="$emit('reveal')"
      :disabled="!hasVotes"
    >
      Reveal Cards
    </button>
    <button
      v-else
      class="btn btn-reset"
      @click="$emit('reset')"
    >
      Start New Round
    </button>
    <button
      v-if="revealed && votesDiffer"
      class="btn btn-fight"
      @click="$emit('fight')"
    >
      Can't decide? Fight it out!
    </button>
  </div>
</template>

<script setup>
defineProps({
  revealed: {
    type: Boolean,
    default: false
  },
  hasVotes: {
    type: Boolean,
    default: false
  },
  votesDiffer: {
    type: Boolean,
    default: false
  }
})

defineEmits(['reveal', 'reset', 'fight'])
</script>

<style scoped>
.room-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-family: inherit;
  font-weight: 700;
  border: var(--border-w) solid var(--color-border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
  box-shadow: var(--shadow);
}

.btn:hover:not(:disabled) {
  transform: var(--hover-transform);
  box-shadow: var(--hover-shadow);
}

.btn:active:not(:disabled) {
  transform: var(--active-transform);
  box-shadow: var(--active-shadow);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-reveal {
  background: var(--color-secondary);
  color: var(--color-text);
}

.btn-reset {
  background: var(--color-accent);
  color: var(--color-text);
}

.btn-fight {
  background: var(--color-primary);
  color: var(--color-black);
}
</style>
