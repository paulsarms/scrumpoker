<template>
  <button
    class="poker-card"
    :class="{
      selected,
      disabled,
      revealed: showValue
    }"
    @click="handleClick"
    :disabled="disabled"
  >
    <span class="card-value">{{ label }}</span>
  </button>
</template>

<script setup>
const props = defineProps({
  value: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showValue: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['select'])

function handleClick() {
  if (!props.disabled) {
    emit('select', props.value)
  }
}
</script>

<style scoped>
.poker-card {
  width: 45px;
  height: 60px;
  background: var(--color-surface);
  border: var(--border-w) solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, background-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  backdrop-filter: var(--card-backdrop);
}

.poker-card:hover:not(:disabled) {
  transform: var(--hover-transform);
  box-shadow: var(--hover-shadow);
}

.poker-card:active:not(:disabled) {
  transform: var(--active-transform);
  box-shadow: var(--active-shadow);
}

.poker-card.selected {
  background: var(--color-primary);
  transform: var(--hover-transform);
  box-shadow: var(--hover-shadow);
}

.poker-card.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.poker-card.disabled:not(.selected) {
  background: var(--color-bg);
}

.card-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.poker-card.selected .card-value {
  color: var(--color-text);
}

@media (min-width: 768px) {
  .poker-card {
    width: 60px;
    height: 80px;
  }

  .card-value {
    font-size: 1.5rem;
  }
}
</style>
