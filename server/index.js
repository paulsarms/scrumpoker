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
  getRoom
} from './rooms.js';

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

      default:
        send(ws, { type: 'error', message: 'Unknown message type' });
    }
  });

  ws.on('close', () => {
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
