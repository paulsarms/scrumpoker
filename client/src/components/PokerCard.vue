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
  width: 60px;
  height: 80px;
  background: var(--color-white);
  border: 4px solid var(--color-black);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, background-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}

.poker-card:hover:not(:disabled) {
  transform: translate(-2px, -4px);
  box-shadow: 8px 10px 0 var(--color-black);
}

.poker-card:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: 4px 4px 0 var(--color-black);
}

.poker-card.selected {
  background: var(--color-primary);
  transform: translate(-2px, -6px);
  box-shadow: 8px 12px 0 var(--color-black);
}

.poker-card.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.poker-card.disabled:not(.selected) {
  background: #e0e0e0;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-black);
}

@media (min-width: 768px) {
  .poker-card {
    width: 70px;
    height: 95px;
  }

  .card-value {
    font-size: 1.75rem;
  }
}
</style>
