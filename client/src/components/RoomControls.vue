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
  }
})

defineEmits(['reveal', 'reset'])
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
  border: 4px solid var(--color-black);
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
  box-shadow: var(--shadow);
}

.btn:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: 8px 8px 0 var(--color-black);
}

.btn:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: 4px 4px 0 var(--color-black);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-reveal {
  background: var(--color-secondary);
  color: var(--color-black);
}

.btn-reset {
  background: var(--color-accent);
  color: var(--color-black);
}
</style>
