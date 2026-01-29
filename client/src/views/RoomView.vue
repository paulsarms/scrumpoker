<template>
  <div class="room">
    <NamePrompt
      v-if="showNamePrompt"
      :defaultName="cachedName"
      @submit="handleNameSubmit"
    />

    <template v-else>
      <div class="room-header">
        <div class="room-info">
          <h1>Room {{ roomId }}</h1>
          <button class="copy-btn" @click="copyRoomLink" :title="copied ? 'Copied!' : 'Copy room link'">
            {{ copied ? 'Copied!' : 'Copy Link' }}
          </button>
        </div>
        <div class="header-actions">
          <button class="reset-room-btn" @click="handleResetRoom">
            Reset Room
          </button>
          <div class="connection-status" :class="{ connected }">
            {{ connected ? 'Connected' : 'Connecting...' }}
          </div>
        </div>
      </div>

      <div v-if="error" class="error-banner">
        {{ error }}
      </div>

      <div class="room-content">
        <div class="main-area">
          <UserList
            :users="room?.users || []"
            :revealed="room?.revealed || false"
            :currentUserId="userId"
          />

          <RoomControls
            :revealed="room?.revealed || false"
            :hasVotes="hasVotes"
            @reveal="handleReveal"
            @reset="handleReset"
          />
        </div>

        <div class="deck-area">
          <CardDeck
            :selectedValue="myVote"
            :disabled="room?.revealed || false"
            @select="handleVote"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWebSocket } from '../composables/useWebSocket.js'
import NamePrompt from '../components/NamePrompt.vue'
import UserList from '../components/UserList.vue'
import RoomControls from '../components/RoomControls.vue'
import CardDeck from '../components/CardDeck.vue'

const route = useRoute()
const roomId = computed(() => route.params.id)

const { connected, room, userId, error, connect, join, vote, reveal, reset, resetRoom } = useWebSocket()

const cachedName = localStorage.getItem('scrumpoker_name') || ''
const userName = ref('')
const showNamePrompt = ref(true)
const copied = ref(false)

const myVote = computed(() => {
  if (!room.value || !userId.value) return null
  const me = room.value.users.find(u => u.id === userId.value)
  return me?.vote === 'hidden' ? 'hidden' : me?.vote
})

const hasVotes = computed(() => {
  return room.value?.users.some(u => u.vote !== null) || false
})

onMounted(() => {
  connect()
})

watch([connected, userName], ([isConnected, name]) => {
  if (isConnected && name && !showNamePrompt.value) {
    join(roomId.value, name)
  }
})

function handleNameSubmit(name) {
  userName.value = name
  localStorage.setItem('scrumpoker_name', name)
  showNamePrompt.value = false
  // The watch will handle calling join() - don't call it here to avoid duplicates
}

function handleVote(value) {
  vote(value)
}

function handleReveal() {
  reveal()
}

function handleReset() {
  reset()
}

function handleResetRoom() {
  if (confirm('Are you sure you want to reset the room? This will kick everyone out.')) {
    resetRoom()
  }
}

async function copyRoomLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}
</script>

<style scoped>
.room {
  max-width: 1200px;
  margin: 0 auto;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.room-info h1 {
  font-size: 1.5rem;
  margin: 0;
}

.copy-btn {
  padding: 0.5rem 1rem;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.875rem;
  background: var(--color-white);
  border: 3px solid var(--color-black);
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.copy-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--color-black);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reset-room-btn {
  padding: 0.5rem 1rem;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.875rem;
  background: var(--color-secondary);
  border: 3px solid var(--color-black);
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.reset-room-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--color-black);
}

.connection-status {
  padding: 0.5rem 1rem;
  font-weight: 700;
  font-size: 0.875rem;
  border: 3px solid var(--color-black);
  background: var(--color-secondary);
}

.connection-status.connected {
  background: var(--color-accent);
}

.error-banner {
  background: var(--color-secondary);
  border: 4px solid var(--color-black);
  padding: 1rem;
  margin-bottom: 2rem;
  font-weight: 700;
}

.room-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.main-area {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.deck-area {
  /* Static on mobile - no sticky positioning */
}
</style>
