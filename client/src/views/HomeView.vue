<template>
  <div class="home">
    <div class="hero">
      <h1>Plan Together</h1>
      <p>Real-time estimation for agile teams</p>
    </div>

    <div class="actions">
      <div class="card">
        <h2>Create a Room</h2>
        <p>Start a new planning session</p>
        <button class="btn btn-primary" @click="createRoom">
          Create Room
        </button>
      </div>

      <div class="card">
        <h2>Join a Room</h2>
        <p>Enter a room code to join</p>
        <form @submit.prevent="joinRoom">
          <input
            v-model="roomCode"
            type="text"
            placeholder="Enter room code"
            class="input"
            maxlength="6"
            pattern="[0-9]*"
          />
          <button type="submit" class="btn btn-secondary" :disabled="!roomCode">
            Join Room
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const roomCode = ref('')

function generateRoomId() {
  return Math.random().toString().slice(2, 8)
}

function createRoom() {
  const roomId = generateRoomId()
  router.push(`/room/${roomId}`)
}

function joinRoom() {
  if (roomCode.value) {
    router.push(`/room/${roomCode.value}`)
  }
}
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.hero p {
  font-size: 1.25rem;
  color: var(--color-text-muted);
}

.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  background: var(--color-surface);
  border: var(--border-w) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  padding: 2rem;
  backdrop-filter: var(--card-backdrop);
}

.card h2 {
  margin-bottom: 0.5rem;
}

.card p {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.card form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input {
  width: 100%;
  padding: 1rem;
  font-size: 1.25rem;
  font-family: inherit;
  font-weight: 500;
  border: var(--border-w) solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-text);
  text-align: center;
  letter-spacing: 0.25em;
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
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
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

.btn-primary {
  background: var(--color-primary);
  color: var(--color-text);
  box-shadow: var(--shadow);
}

.btn-secondary {
  background: var(--color-accent);
  color: var(--color-text);
  box-shadow: var(--shadow);
}
</style>
