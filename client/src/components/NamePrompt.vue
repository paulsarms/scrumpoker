<template>
  <div class="name-prompt-overlay">
    <div class="name-prompt">
      <h2>What's your name?</h2>
      <form @submit.prevent="handleSubmit">
        <input
          ref="inputRef"
          v-model="name"
          type="text"
          placeholder="Enter your name"
          class="input"
          maxlength="20"
          required
        />
        <button type="submit" class="btn" :disabled="!name.trim()">
          Join Room
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  defaultName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['submit'])

const name = ref(props.defaultName)
const inputRef = ref(null)

onMounted(() => {
  inputRef.value?.focus()
  inputRef.value?.select()
})

function handleSubmit() {
  const trimmedName = name.value.trim()
  if (trimmedName) {
    emit('submit', trimmedName)
  }
}
</script>

<style scoped>
.name-prompt-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.name-prompt {
  background: var(--color-surface);
  border: var(--border-w) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--hover-shadow);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  backdrop-filter: var(--card-backdrop);
}

.name-prompt h2 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.name-prompt form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input {
  width: 100%;
  padding: 1rem;
  font-size: 1.125rem;
  font-family: inherit;
  font-weight: 500;
  border: var(--border-w) solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-text);
  backdrop-filter: var(--card-backdrop);
}

.input:focus {
  outline: none;
  box-shadow: var(--shadow);
}

.btn {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-family: inherit;
  font-weight: 700;
  border: var(--border-w) solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-primary);
  color: var(--color-text);
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
</style>
