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
  color: #666;
}

.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  background: var(--color-white);
  border: 4px solid var(--color-black);
  box-shadow: var(--shadow);
  padding: 2rem;
}

.card h2 {
  margin-bottom: 0.5rem;
}

.card p {
  color: #666;
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
  border: 4px solid var(--color-black);
  background: var(--color-white);
  text-align: center;
  letter-spacing: 0.25em;
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
  border: 4px solid var(--color-black);
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
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

.btn-primary {
  background: var(--color-primary);
  color: var(--color-black);
  box-shadow: var(--shadow);
}

.btn-secondary {
  background: var(--color-accent);
  color: var(--color-black);
  box-shadow: var(--shadow);
}
</style>
