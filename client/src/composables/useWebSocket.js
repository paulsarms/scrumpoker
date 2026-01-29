import { ref, onUnmounted } from 'vue'

export function useWebSocket() {
  const ws = ref(null)
  const connected = ref(false)
  const room = ref(null)
  const userId = ref(null)
  const error = ref(null)

  let reconnectTimeout = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5
  let savedRoomId = null
  let savedUserName = null

  function getWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    return `${protocol}//${host}/ws`
  }

  function connect() {
    if (ws.value?.readyState === WebSocket.OPEN) return

    const url = getWebSocketUrl()
    ws.value = new WebSocket(url)

    ws.value.onopen = () => {
      connected.value = true
      error.value = null
      reconnectAttempts = 0

      // Rejoin room if we have saved credentials
      if (savedRoomId && savedUserName) {
        join(savedRoomId, savedUserName)
      }
    }

    ws.value.onclose = () => {
      connected.value = false

      // Try to reconnect
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
        reconnectTimeout = setTimeout(connect, delay)
      }
    }

    ws.value.onerror = (e) => {
      console.error('WebSocket error:', e)
      error.value = 'Connection error'
    }

    ws.value.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        handleMessage(message)
      } catch (e) {
        console.error('Failed to parse message:', e)
      }
    }
  }

  function handleMessage(message) {
    switch (message.type) {
      case 'room_state':
        room.value = message.room
        if (message.userId) {
          userId.value = message.userId
        }
        break

      case 'user_joined':
        if (room.value) {
          room.value.users.push(message.user)
        }
        break

      case 'user_left':
        if (room.value) {
          room.value.users = room.value.users.filter(u => u.id !== message.userId)
        }
        break

      case 'error':
        error.value = message.message
        break

      case 'room_reset':
        // Room was reset, reload the page to show name entry
        window.location.reload()
        break
    }
  }

  function send(message) {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(message))
    }
  }

  function join(roomId, userName) {
    savedRoomId = roomId
    savedUserName = userName
    send({ type: 'join', roomId, userName })
  }

  function vote(value) {
    send({ type: 'vote', value })
  }

  function reveal() {
    send({ type: 'reveal' })
  }

  function reset() {
    send({ type: 'reset' })
  }

  function resetRoom() {
    send({ type: 'reset_room' })
  }

  function disconnect() {
    savedRoomId = null
    savedUserName = null
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
    }
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    connected.value = false
    room.value = null
    userId.value = null
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    connected,
    room,
    userId,
    error,
    connect,
    join,
    vote,
    reveal,
    reset,
    resetRoom,
    disconnect
  }
}
