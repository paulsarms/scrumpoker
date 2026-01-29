import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'rooms.json');

export function loadRooms() {
  if (!existsSync(DATA_FILE)) {
    return new Map();
  }
  try {
    const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
    return new Map(Object.entries(data));
  } catch (err) {
    console.error('Error loading rooms:', err);
    return new Map();
  }
}

export function saveRooms(rooms) {
  try {
    const data = Object.fromEntries(rooms);
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving rooms:', err);
  }
}

export function cleanupStaleRooms(rooms, maxAge = 24 * 60 * 60 * 1000) {
  const now = Date.now();
  let cleaned = 0;
  for (const [id, room] of rooms) {
    if (now - room.lastActivity > maxAge) {
      rooms.delete(id);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    saveRooms(rooms);
    console.log(`Cleaned up ${cleaned} stale room(s)`);
  }
  return cleaned;
}
