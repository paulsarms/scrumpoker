<template>
  <div class="card-deck">
    <h3 class="deck-title">Pick your card</h3>
    <div class="cards">
      <PokerCard
        v-for="card in cards"
        :key="card.value"
        :value="card.value"
        :label="card.label"
        :selected="selectedValue === card.value"
        :disabled="disabled"
        @select="handleSelect"
      />
    </div>
  </div>
</template>

<script setup>
import PokerCard from './PokerCard.vue'

const props = defineProps({
  selectedValue: {
    type: String,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const cards = [
  { value: '?', label: '?' },
  { value: 'coffee', label: '☕' },
  { value: '0', label: '0' },
  { value: '0.5', label: '½' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '5', label: '5' },
  { value: '8', label: '8' },
  { value: '13', label: '13' },
  { value: '20', label: '20' },
  { value: '40', label: '40' },
  { value: '100', label: '100' },
  { value: 'million', label: '💀' }
]

function handleSelect(value) {
  emit('select', value)
}
</script>

<style scoped>
.card-deck {
  background: var(--color-white);
  border: 4px solid var(--color-black);
  padding: 1.5rem;
}

.deck-title {
  margin-bottom: 1rem;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

@media (min-width: 768px) {
  .cards {
    gap: 1rem;
  }
}
</style>
