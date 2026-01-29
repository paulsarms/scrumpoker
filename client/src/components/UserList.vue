<template>
  <div class="user-list">
    <h3 class="list-title">
      Players ({{ users.length }})
    </h3>
    <div class="users">
      <div
        v-for="user in users"
        :key="user.id"
        class="user-row"
        :class="{
          'is-you': user.id === currentUserId,
          'has-voted': user.vote !== null,
          'revealed': revealed
        }"
      >
        <div class="user-name">
          {{ user.name }}
          <span v-if="user.id === currentUserId" class="you-badge">(You)</span>
        </div>
        <div class="user-vote">
          <template v-if="revealed && user.vote !== null">
            {{ getVoteLabel(user.vote) }}
          </template>
          <template v-else-if="user.vote !== null">
            ✓
          </template>
          <template v-else>
            ?
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  users: {
    type: Array,
    required: true
  },
  revealed: {
    type: Boolean,
    default: false
  },
  currentUserId: {
    type: String,
    default: null
  }
})

const voteLabels = {
  '?': '?',
  'coffee': '☕',
  '0': '0',
  '0.5': '½',
  '1': '1',
  '2': '2',
  '3': '3',
  '5': '5',
  '8': '8',
  '13': '13',
  '20': '20',
  '40': '40',
  '100': '100',
  'million': '💀'
}

function getVoteLabel(vote) {
  return voteLabels[vote] || vote
}
</script>

<style scoped>
.user-list {
  background: var(--color-white);
  border: 4px solid var(--color-black);
  padding: 1rem;
}

.list-title {
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.users {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--color-black);
  background: #f0f0f0;
  transition: background-color 0.2s;
}

.user-row.is-you {
  border-color: var(--color-accent);
  border-width: 3px;
}

.user-row.has-voted {
  background: var(--color-primary);
}

.user-row.revealed.has-voted {
  background: var(--color-accent);
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
  word-break: break-word;
}

.you-badge {
  font-size: 0.7rem;
  color: #666;
  margin-left: 0.25rem;
}

.user-vote {
  width: 36px;
  height: 48px;
  background: var(--color-white);
  border: 2px solid var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  flex-shrink: 0;
}

.user-row.has-voted:not(.revealed) .user-vote {
  background: var(--color-black);
  color: var(--color-white);
}

@media (min-width: 640px) {
  .user-list {
    padding: 1.5rem;
  }

  .list-title {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .users {
    gap: 0.75rem;
  }

  .user-row {
    padding: 0.75rem 1rem;
    border-width: 3px;
  }

  .user-row.is-you {
    border-width: 4px;
  }

  .user-name {
    font-size: 1rem;
  }

  .user-vote {
    width: 45px;
    height: 60px;
    font-size: 1.25rem;
    border-width: 3px;
  }
}
</style>
