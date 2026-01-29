import { v4 as uuidv4 } from 'uuid';
import { loadRooms, saveRooms, cleanupStaleRooms } from './storage.js';

const rooms = loadRooms();
const userConnections = new Map(); // Maps WebSocket to { roomId, userId }

// Export for funMode to access user connections
export function getUserConnection(ws) {
  return userConnections.get(ws);
}

// Get all connections for a room
export function getRoomConnections(roomId) {
  const connections = [];
  for (const [ws, conn] of userConnections) {
    if (conn.roomId === roomId) {
      connections.push({ ws, ...conn });
    }
  }
  return connections;
}

// Cleanup stale rooms on startup and every hour
cleanupStaleRooms(rooms);
setInterval(() => cleanupStaleRooms(rooms), 60 * 60 * 1000);

function generateRoomId() {
  return Math.random().toString().slice(2, 8);
}

export function createRoom() {
  let id = generateRoomId();
  while (rooms.has(id)) {
    id = generateRoomId();
  }

  const room = {
    id,
    users: [],
    revealed: false,
    createdAt: Date.now(),
    lastActivity: Date.now()
  };

  rooms.set(id, room);
  saveRooms(rooms);
  return room;
}

export function getRoom(roomId) {
  return rooms.get(roomId);
}

export function joinRoom(roomId, userName, ws) {
  let room = rooms.get(roomId);

  if (!room) {
    room = {
      id: roomId,
      users: [],
      revealed: false,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    rooms.set(roomId, room);
  }

  const userId = uuidv4();
  const user = {
    id: userId,
    name: userName,
    vote: null
  };

  room.users.push(user);
  room.lastActivity = Date.now();

  userConnections.set(ws, { roomId, userId });

  saveRooms(rooms);
  return { room, userId };
}

export function leaveRoom(ws) {
  const connection = userConnections.get(ws);
  if (!connection) return null;

  const { roomId, userId } = connection;
  const room = rooms.get(roomId);

  if (room) {
    room.users = room.users.filter(u => u.id !== userId);
    room.lastActivity = Date.now();

    if (room.users.length === 0) {
      rooms.delete(roomId);
    }

    saveRooms(rooms);
  }

  userConnections.delete(ws);
  return { roomId, userId };
}

export function vote(ws, value) {
  const connection = userConnections.get(ws);
  if (!connection) return null;

  const { roomId, userId } = connection;
  const room = rooms.get(roomId);

  if (!room || room.revealed) return null;

  const user = room.users.find(u => u.id === userId);
  if (user) {
    user.vote = value;
    room.lastActivity = Date.now();
    saveRooms(rooms);
  }

  return room;
}

export function reveal(ws) {
  const connection = userConnections.get(ws);
  if (!connection) return null;

  const { roomId } = connection;
  const room = rooms.get(roomId);

  if (!room) return null;

  room.revealed = true;
  room.lastActivity = Date.now();
  saveRooms(rooms);

  return room;
}

export function reset(ws) {
  const connection = userConnections.get(ws);
  if (!connection) return null;

  const { roomId } = connection;
  const room = rooms.get(roomId);

  if (!room) return null;

  room.revealed = false;
  room.users.forEach(u => u.vote = null);
  room.lastActivity = Date.now();
  saveRooms(rooms);

  return room;
}

export function getRoomClients(roomId, wss) {
  const clients = [];
  for (const [ws, conn] of userConnections) {
    if (conn.roomId === roomId && ws.readyState === ws.OPEN) {
      clients.push(ws);
    }
  }
  return clients;
}

export function getPublicRoomState(room) {
  return {
    id: room.id,
    users: room.users.map(u => ({
      id: u.id,
      name: u.name,
      vote: room.revealed ? u.vote : (u.vote !== null ? 'hidden' : null)
    })),
    revealed: room.revealed
  };
}

export function resetRoom(ws) {
  const connection = userConnections.get(ws);
  if (!connection) return null;

  const { roomId } = connection;
  const room = rooms.get(roomId);

  if (!room) return null;

  // Get all WebSocket clients BEFORE removing them
  const clients = [];
  for (const [clientWs, conn] of userConnections) {
    if (conn.roomId === roomId) {
      clients.push(clientWs);
    }
  }

  // Clear all users from the room
  room.users = [];
  room.revealed = false;
  room.lastActivity = Date.now();

  // Remove all user connections for this room
  for (const [clientWs, conn] of userConnections) {
    if (conn.roomId === roomId) {
      userConnections.delete(clientWs);
    }
  }

  // Delete the room since it's now empty
  rooms.delete(roomId);
  saveRooms(rooms);

  return { roomId, clients };
}
