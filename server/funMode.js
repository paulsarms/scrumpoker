// Fun Mode: Space Shooter Game Engine
// Server-authoritative architecture - clients only send inputs

// Game Constants
export const TICK_RATE = 20; // 20Hz (50ms per tick)
export const TICK_INTERVAL = 1000 / TICK_RATE;
export const BULLET_SPEED = 0.025; // Faster than players
export const PLAYER_RADIUS = 0.022; // For collision (reduced ~45% from original 0.04)
export const BULLET_RADIUS = 0.015;
export const SHOOT_COOLDOWN = 300; // ms
export const INVINCIBILITY_DURATION = 500; // ms after being hit
export const STARTING_LIVES = 3;
export const ARENA_MIN = 0.05;
export const ARENA_MAX = 0.95;

// Physics constants (Asteroids-style momentum)
export const THRUST_ACCELERATION = 0.0008; // Acceleration per tick when thrusting
export const MAX_SPEED = 0.015; // Maximum velocity magnitude
export const DRAG = 0.995; // Velocity multiplier per tick (subtle friction)
export const BULLET_MAX_DISTANCE = 1.0; // Bullets travel ~1 screen length before despawning
export const GAME_START_GRACE_PERIOD = 5000; // No shooting during splash screen (ms)

// Active game instances per room
const games = new Map();

/**
 * Create initial player state
 */
function createPlayer(userId, userName, index, totalPlayers) {
  // Distribute players evenly around the arena
  const angle = (index / totalPlayers) * Math.PI * 2;
  const radius = 0.3;
  const centerX = 0.5;
  const centerY = 0.5;

  return {
    id: userId,
    name: userName,
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius,
    vx: 0, // Velocity X (Asteroids-style momentum)
    vy: 0, // Velocity Y
    rotation: angle + Math.PI, // Face center
    lives: STARTING_LIVES,
    alive: true,
    lastShot: 0,
    invincibleUntil: 0,
    eliminatedAt: null, // Tick when eliminated
    input: {
      up: false,
      down: false,
      left: false,
      right: false,
      shooting: false
    }
  };
}

/**
 * Create a new bullet
 */
function createBullet(player, tick) {
  return {
    id: `${player.id}-${tick}-${Math.random().toString(36).slice(2, 6)}`,
    ownerId: player.id,
    x: player.x + Math.cos(player.rotation) * (PLAYER_RADIUS + BULLET_RADIUS + 0.01),
    y: player.y + Math.sin(player.rotation) * (PLAYER_RADIUS + BULLET_RADIUS + 0.01),
    rotation: player.rotation,
    createdAt: tick,
    distanceTraveled: 0 // Track distance for despawn after ~1 screen length
  };
}

/**
 * Check circle-circle collision
 */
function checkCollision(x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < r1 + r2;
}

/**
 * Clamp value between min and max
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Wrap value around boundaries (for infinite playfield)
 */
function wrap(value, min, max) {
  const range = max - min;
  if (value < min) return max - ((min - value) % range);
  if (value > max) return min + ((value - max) % range);
  return value;
}

/**
 * Initialize a new game for a room
 */
export function startGame(roomId, users, startedBy) {
  const players = {};
  users.forEach((user, index) => {
    players[user.id] = createPlayer(user.id, user.name, index, users.length);
  });

  const game = {
    roomId,
    startedBy,
    startedAt: Date.now(),
    tick: 0,
    players,
    bullets: [],
    hitEvents: [],
    eliminations: [], // Track elimination order
    gameOver: false,
    winner: null,
    intervalId: null
  };

  games.set(roomId, game);
  return game;
}

/**
 * Stop and cleanup a game
 */
export function stopGame(roomId) {
  const game = games.get(roomId);
  if (game) {
    if (game.intervalId) {
      clearInterval(game.intervalId);
    }
    games.delete(roomId);
  }
}

/**
 * Get current game for a room
 */
export function getGame(roomId) {
  return games.get(roomId);
}

/**
 * Update player input state
 */
export function updatePlayerInput(roomId, userId, input) {
  const game = games.get(roomId);
  if (!game || !game.players[userId]) return;

  const player = game.players[userId];
  if (player.alive) {
    player.input = { ...player.input, ...input };
  }
}

/**
 * Add a new player mid-game
 */
export function addPlayerToGame(roomId, userId, userName) {
  const game = games.get(roomId);
  if (!game) return;

  // Random position
  const player = createPlayer(userId, userName, Math.random(), 1);
  player.x = ARENA_MIN + Math.random() * (ARENA_MAX - ARENA_MIN);
  player.y = ARENA_MIN + Math.random() * (ARENA_MAX - ARENA_MIN);
  player.rotation = Math.random() * Math.PI * 2;

  game.players[userId] = player;
}

/**
 * Remove a player from the game (disconnect)
 */
export function removePlayerFromGame(roomId, userId) {
  const game = games.get(roomId);
  if (!game || !game.players[userId]) return;

  const player = game.players[userId];
  if (player.alive) {
    player.alive = false;
    player.eliminatedAt = game.tick;
    game.eliminations.push({
      id: userId,
      name: player.name,
      tick: game.tick,
      reason: 'disconnect'
    });
  }

  // Transfer startedBy if needed
  if (game.startedBy === userId) {
    const alivePlayers = Object.values(game.players).filter(p => p.alive);
    if (alivePlayers.length > 0) {
      game.startedBy = alivePlayers[0].id;
    }
  }
}

/**
 * Process one game tick
 */
export function processTick(game) {
  if (game.gameOver) return null;

  game.tick++;
  game.hitEvents = [];
  const now = Date.now();

  const alivePlayers = Object.values(game.players).filter(p => p.alive);

  // 1. Process player inputs and update positions (Asteroids-style momentum)
  for (const player of alivePlayers) {
    const { input } = player;

    // Rotation (instant, no momentum)
    if (input.left) player.rotation -= 0.1;
    if (input.right) player.rotation += 0.1;

    // Thrust applies acceleration in facing direction
    if (input.up) {
      player.vx += Math.cos(player.rotation) * THRUST_ACCELERATION;
      player.vy += Math.sin(player.rotation) * THRUST_ACCELERATION;
    }

    // Cap velocity at max speed
    const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
    if (speed > MAX_SPEED) {
      player.vx = (player.vx / speed) * MAX_SPEED;
      player.vy = (player.vy / speed) * MAX_SPEED;
    }

    // Apply velocity to position (momentum continues without thrust)
    player.x += player.vx;
    player.y += player.vy;

    // Apply drag (subtle friction)
    player.vx *= DRAG;
    player.vy *= DRAG;

    // Wrap around screen edges (infinite playfield)
    player.x = wrap(player.x, ARENA_MIN, ARENA_MAX);
    player.y = wrap(player.y, ARENA_MIN, ARENA_MAX);

    // 2. Handle shooting (disabled during splash screen grace period)
    const canShoot = now - game.startedAt >= GAME_START_GRACE_PERIOD;
    if (canShoot && input.shooting && now - player.lastShot >= SHOOT_COOLDOWN) {
      game.bullets.push(createBullet(player, game.tick));
      player.lastShot = now;
    }
  }

  // 3. Update bullets (wrap around screen, despawn after max distance)
  const activeBullets = [];
  for (const bullet of game.bullets) {
    // Move bullet
    const dx = Math.cos(bullet.rotation) * BULLET_SPEED;
    const dy = Math.sin(bullet.rotation) * BULLET_SPEED;
    bullet.x += dx;
    bullet.y += dy;

    // Track distance traveled
    bullet.distanceTraveled += BULLET_SPEED;

    // Wrap around screen edges
    bullet.x = wrap(bullet.x, 0, 1);
    bullet.y = wrap(bullet.y, 0, 1);

    // Keep if hasn't traveled too far
    if (bullet.distanceTraveled < BULLET_MAX_DISTANCE) {
      activeBullets.push(bullet);
    }
  }
  game.bullets = activeBullets;

  // 4. Collision detection
  const bulletsToRemove = new Set();

  for (const bullet of game.bullets) {
    for (const player of alivePlayers) {
      // Skip self-bullets
      if (bullet.ownerId === player.id) continue;

      // Skip invincible players
      if (now < player.invincibleUntil) continue;

      if (checkCollision(bullet.x, bullet.y, BULLET_RADIUS, player.x, player.y, PLAYER_RADIUS)) {
        // Hit!
        bulletsToRemove.add(bullet.id);
        player.lives--;
        player.invincibleUntil = now + INVINCIBILITY_DURATION;

        game.hitEvents.push({
          playerId: player.id,
          bulletOwnerId: bullet.ownerId,
          tick: game.tick
        });

        if (player.lives <= 0) {
          player.alive = false;
          player.eliminatedAt = game.tick;
          game.eliminations.push({
            id: player.id,
            name: player.name,
            tick: game.tick,
            killedBy: bullet.ownerId,
            reason: 'killed'
          });
        }

        break; // Bullet can only hit one player
      }
    }
  }

  game.bullets = game.bullets.filter(b => !bulletsToRemove.has(b.id));

  // 5. Check win condition
  const remainingPlayers = Object.values(game.players).filter(p => p.alive);

  if (remainingPlayers.length <= 1) {
    game.gameOver = true;
    game.winner = remainingPlayers.length === 1 ? remainingPlayers[0] : null;
    return buildEndState(game);
  }

  return buildGameState(game);
}

/**
 * Build game state for broadcast
 */
function buildGameState(game) {
  const now = Date.now();
  return {
    type: 'fun_state',
    tick: game.tick,
    players: Object.values(game.players).map(p => ({
      id: p.id,
      name: p.name,
      x: p.x,
      y: p.y,
      rotation: p.rotation,
      lives: p.lives,
      alive: p.alive,
      invincible: now < p.invincibleUntil,
      thrusting: p.input.up,
      shooting: now - p.lastShot < 100 // Show muzzle flash for 100ms after firing
    })),
    bullets: game.bullets.map(b => ({
      id: b.id,
      x: b.x,
      y: b.y,
      rotation: b.rotation,
      ownerId: b.ownerId
    })),
    hitEvents: game.hitEvents
  };
}

/**
 * Build end game state with rankings
 */
function buildEndState(game) {
  // Build rankings: winner first, then by elimination order (last eliminated = better rank)
  const rankings = [];

  // Winner first
  if (game.winner) {
    rankings.push({
      id: game.winner.id,
      name: game.winner.name,
      rank: 1,
      survived: true
    });
  }

  // Then eliminations in reverse order (last eliminated = better rank)
  const sortedEliminations = [...game.eliminations].reverse();
  let rank = game.winner ? 2 : 1;

  for (const elim of sortedEliminations) {
    rankings.push({
      id: elim.id,
      name: elim.name,
      rank: rank++,
      survived: false,
      killedBy: elim.killedBy,
      reason: elim.reason
    });
  }

  return {
    type: 'fun_ended',
    rankings,
    startedBy: game.startedBy
  };
}

/**
 * Start the game loop for a room
 */
export function startGameLoop(roomId, broadcastFn) {
  const game = games.get(roomId);
  if (!game) return;

  game.intervalId = setInterval(() => {
    const state = processTick(game);
    if (state) {
      broadcastFn(state);

      if (state.type === 'fun_ended') {
        clearInterval(game.intervalId);
        game.intervalId = null;
      }
    }
  }, TICK_INTERVAL);
}
