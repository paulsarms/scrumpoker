# Scrum Poker

A real-time scrum poker (planning poker) application with a Vue 3 frontend and Node.js/WebSocket backend, styled in neo brutalism.

## Features

- Real-time voting synchronization across all participants
- Support for standard poker planning cards (?, ☕, 0, ½, 1, 2, 3, 5, 8, 13, 20, 40, 100, 💀)
- Room-based sessions with shareable links
- Persistent storage (rooms survive server restarts)
- Automatic cleanup of stale rooms (24h inactivity)
- Responsive design for mobile and desktop
- Neo brutalism design aesthetic

## Tech Stack

- **Frontend**: Vue 3 (Composition API) + Vite + Vue Router
- **Backend**: Node.js + Express + `ws` (WebSocket library)
- **Styling**: Custom CSS (neo brutalism)
- **Persistence**: JSON file storage

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

1. Install server dependencies:
```bash
cd server
npm install
```

2. Install client dependencies:
```bash
cd client
npm install
```

### Development

1. Start the server:
```bash
cd server
npm run dev
```

2. In a new terminal, start the client:
```bash
cd client
npm run dev
```

3. Open http://localhost:5173 in your browser

### Production Build

1. Build the client:
```bash
cd client
npm run build
```

2. Start the server:
```bash
cd server
npm start
```

## Project Structure

```
scrumpoker/
├── server/
│   ├── index.js          # Express + WebSocket server
│   ├── rooms.js          # Room management logic
│   ├── storage.js        # JSON file persistence
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── router.js
│   │   ├── composables/
│   │   │   └── useWebSocket.js
│   │   ├── components/
│   │   │   ├── PokerCard.vue
│   │   │   ├── CardDeck.vue
│   │   │   ├── UserList.vue
│   │   │   ├── NamePrompt.vue
│   │   │   └── RoomControls.vue
│   │   ├── views/
│   │   │   ├── HomeView.vue
│   │   │   └── RoomView.vue
│   │   └── assets/
│   │       └── styles.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## WebSocket Protocol

### Client → Server

- `{ type: "join", roomId, userName }` - Join or create a room
- `{ type: "vote", value }` - Cast a vote
- `{ type: "reveal" }` - Reveal all cards
- `{ type: "reset" }` - Start a new round

### Server → Client

- `{ type: "room_state", room, userId }` - Full room state
- `{ type: "user_joined", user }` - New user notification
- `{ type: "user_left", userId }` - User disconnected
- `{ type: "error", message }` - Error message

## Deployment

### Server Requirements

- Node.js 18+
- PM2 for process management (recommended)
- Nginx as reverse proxy (recommended)

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /var/www/scrumpoker/client/dist;
        try_files $uri $uri/ /index.html;
    }

    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### PM2 Setup

```bash
cd server
pm2 start index.js --name scrumpoker
pm2 save
pm2 startup
```

## License

MIT
