import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  vote,
  reveal,
  reset,
  resetRoom,
  getRoomClients,
  getPublicRoomState,
  getRoom,
  getUserConnection,
  getRoomConnections
} from './rooms.js';
import {
  startGame,
  stopGame,
  getGame,
  updatePlayerInput,
  addPlayerToGame,
  removePlayerFromGame,
  startGameLoop
} from './funMode.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create room endpoint (optional REST API)
app.post('/api/rooms', (req, res) => {
  const room = createRoom();
  res.json({ roomId: room.id });
});

function broadcast(roomId, message, excludeWs = null) {
  const clients = getRoomClients(roomId, wss);
  const data = JSON.stringify(message);

  clients.forEach(client => {
    if (client !== excludeWs) {
      client.send(data);
    }
  });
}

function send(ws, message) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (data) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch (err) {
      send(ws, { type: 'error', message: 'Invalid message format' });
      return;
    }

    switch (message.type) {
      case 'join': {
        const { roomId, userName } = message;

        if (!roomId || !userName) {
          send(ws, { type: 'error', message: 'Room ID and username are required' });
          return;
        }

        const { room, userId } = joinRoom(roomId, userName, ws);

        // Send room state to the joining user
        send(ws, {
          type: 'room_state',
          room: getPublicRoomState(room),
          userId
        });

        // Notify others in the room
        broadcast(roomId, {
          type: 'user_joined',
          user: { id: userId, name: userName, vote: null }
        }, ws);

        console.log(`${userName} joined room ${roomId}`);
        break;
      }

      case 'vote': {
        const room = vote(ws, message.value);

        if (room) {
          broadcast(room.id, {
            type: 'room_state',
            room: getPublicRoomState(room)
          });
        }
        break;
      }

      case 'reveal': {
        const room = reveal(ws);

        if (room) {
          broadcast(room.id, {
            type: 'room_state',
            room: getPublicRoomState(room)
          });
        }
        break;
      }

      case 'reset': {
        const room = reset(ws);

        if (room) {
          broadcast(room.id, {
            type: 'room_state',
            room: getPublicRoomState(room)
          });
        }
        break;
      }

      case 'reset_room': {
        const result = resetRoom(ws);

        if (result) {
          const { roomId, clients } = result;
          // Notify all clients to reload (using saved client list since connections are now cleared)
          const data = JSON.stringify({ type: 'room_reset' });
          clients.forEach(client => {
            if (client.readyState === client.OPEN) {
              client.send(data);
            }
          });
          console.log(`Room ${roomId} has been reset`);
        }
        break;
      }

      // Fun Mode handlers
      case 'fun_start': {
        const connection = getUserConnection(ws);
        if (!connection) break;

        const { roomId, userId } = connection;
        const room = getRoom(roomId);
        if (!room) break;

        // Check if game already running
        if (getGame(roomId)) {
          send(ws, { type: 'error', message: 'Fun Mode already active' });
          break;
        }

        // Start the game with all users in the room
        startGame(roomId, room.users, userId);

        // Broadcast game started
        broadcast(roomId, { type: 'fun_started', startedBy: userId });

        // Start game loop
        startGameLoop(roomId, (state) => {
          broadcast(roomId, state);
        });

        console.log(`Fun Mode started in room ${roomId} by user ${userId}`);
        break;
      }

      case 'fun_input': {
        const connection = getUserConnection(ws);
        if (!connection) break;

        const { roomId, userId } = connection;
        updatePlayerInput(roomId, userId, message.input);
        break;
      }

      case 'fun_restart': {
        const connection = getUserConnection(ws);
        if (!connection) break;

        const { roomId, userId } = connection;
        const game = getGame(roomId);

        // Only startedBy user can restart
        if (!game || game.startedBy !== userId) {
          send(ws, { type: 'error', message: 'Only the game starter can restart' });
          break;
        }

        const room = getRoom(roomId);
        if (!room) break;

        // Stop current game and start new one
        stopGame(roomId);
        startGame(roomId, room.users, userId);

        broadcast(roomId, { type: 'fun_started', startedBy: userId });

        startGameLoop(roomId, (state) => {
          broadcast(roomId, state);
        });

        console.log(`Fun Mode restarted in room ${roomId}`);
        break;
      }

      case 'fun_exit': {
        const connection = getUserConnection(ws);
        if (!connection) break;

        const { roomId, userId } = connection;
        const game = getGame(roomId);

        // Only startedBy user can exit for everyone
        if (game && game.startedBy === userId) {
          stopGame(roomId);
          broadcast(roomId, { type: 'fun_stopped' });
          console.log(`Fun Mode stopped in room ${roomId}`);
        }
        break;
      }

      default:
        send(ws, { type: 'error', message: 'Unknown message type' });
    }
  });

  ws.on('close', () => {
    // Get connection info before leaving
    const connection = getUserConnection(ws);

    // Handle Fun Mode disconnect
    if (connection) {
      const { roomId, userId } = connection;
      const game = getGame(roomId);
      if (game) {
        removePlayerFromGame(roomId, userId);

        // Check if startedBy left and transfer control
        if (game.startedBy === userId) {
          const alivePlayers = Object.values(game.players).filter(p => p.alive);
          if (alivePlayers.length > 0) {
            game.startedBy = alivePlayers[0].id;
          }
        }
      }
    }

    const result = leaveRoom(ws);

    if (result) {
      const { roomId, userId } = result;
      broadcast(roomId, { type: 'user_left', userId });
      console.log(`User ${userId} left room ${roomId}`);
    }

    console.log('Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

const PORT = process.env.PORT || 4567;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
