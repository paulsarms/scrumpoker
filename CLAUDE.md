# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Server (port 4567, auto-restarts on changes)
cd server && npm run dev

# Client (port 5173, proxies /ws to server)
cd client && npm run dev
```

Both must run simultaneously. Client Vite proxy forwards WebSocket connections to the server.

### Production
```bash
cd client && npm run build    # outputs to client/dist/
cd server && npm start         # serves on PORT env var or 4567
```

### No test or lint tooling is configured.

## Architecture

This is a real-time scrum poker app with a **Fun Mode** (Asteroids-style space shooter mini-game).

### Client (Vue 3 + Vite)
- **Composition API** throughout, no Options API
- Two routes: `/` (HomeView) and `/room/:id` (RoomView)
- Two composables drive all logic:
  - `useWebSocket.js` — manages WebSocket connection, reconnection (exponential backoff, max 5 attempts), room state, and all message dispatch/handling for both poker and Fun Mode
  - `useFunMode.js` — wraps WebSocket composable with keyboard input handling (WASD/arrows + space) and game-specific computed state
- WebSocket URL: uses `VITE_WS_URL` env var in production, otherwise derives from `window.location`

### Server (Node.js + Express + ws)
- **ESM modules** (`"type": "module"` in both package.json files)
- Single WebSocket endpoint at `/ws` handles all real-time communication
- `rooms.js` — room lifecycle (create/join/leave/vote/reveal/reset), tracks user-to-WebSocket mapping via `userConnections` Map. Reconnection by username match (same name in same room reuses existing user entry)
- `storage.js` — JSON file persistence to `server/rooms.json` (gitignored), stale room cleanup every hour (24h inactivity threshold)
- `funMode.js` — server-authoritative game engine running at 20Hz. Asteroids-style physics (thrust/momentum/drag/screen-wrap). Only the game starter can restart/exit the game for everyone

### WebSocket Protocol
Client sends: `join`, `vote`, `reveal`, `reset`, `reset_room`, `fun_start`, `fun_input`, `fun_restart`, `fun_exit`
Server sends: `room_state`, `user_joined`, `user_left`, `error`, `room_reset`, `fun_started`, `fun_state`, `fun_ended`, `fun_stopped`

### Styling
Neo brutalism aesthetic via custom CSS (`client/src/assets/styles.css`). No CSS framework.
