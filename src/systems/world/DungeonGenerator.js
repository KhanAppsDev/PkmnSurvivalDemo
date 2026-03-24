import { createRNG, randInt, shuffle } from '../../utils/rng.js';

/**
 * DungeonGenerator — procedurally builds a dungeon floor layout.
 * Writes directly into gameState.dungeon.floor.
 *
 * Tile types: 'wall' | 'floor' | 'corridor'
 */
export class DungeonGenerator {
  constructor(game) {
    this.game   = game;
    this.active = false; // not in update loop — called on demand
  }

  /**
   * Generate a new floor and write it into gameState.dungeon.floor.
   * @param {number} floorNumber  1-based
   * @param {string} branch       Dungeon branch id
   */
  generateFloor(floorNumber, branch) {
    const state = this.game.state;
    const seed  = state.rngSeed + (state.day * 1000) + floorNumber;
    const rng   = createRNG(seed);

    const W = 24, H = 20; // dungeon grid dimensions in tiles

    // ── 1. Build empty wall grid ───────────────────────────────────────
    const grid = Array.from({ length: H }, () =>
      Array.from({ length: W }, () => ({ type: 'wall', isRevealed: false }))
    );

    // ── 2. Place rooms ────────────────────────────────────────────────
    const rooms = [];
    const attempts = 20;
    const minRooms = 4, maxRooms = 7;
    const targetRooms = randInt(minRooms, maxRooms, rng);

    for (let i = 0; i < attempts && rooms.length < targetRooms; i++) {
      const rw = randInt(3, 7, rng);
      const rh = randInt(3, 6, rng);
      const rx = randInt(1, W - rw - 2, rng);
      const ry = randInt(1, H - rh - 2, rng);

      // Check no overlap (with 1-tile buffer)
      const overlaps = rooms.some(r =>
        rx <= r.x + r.w + 1 && rx + rw + 1 >= r.x &&
        ry <= r.y + r.h + 1 && ry + rh + 1 >= r.y
      );
      if (!overlaps) {
        rooms.push({ x: rx, y: ry, w: rw, h: rh });
        // Carve room
        for (let cy = ry; cy < ry + rh; cy++) {
          for (let cx = rx; cx < rx + rw; cx++) {
            grid[cy][cx] = { type: 'floor', isRevealed: false };
          }
        }
      }
    }

    // ── 3. Connect rooms with corridors ───────────────────────────────
    const shuffledRooms = shuffle([...rooms], rng);
    for (let i = 0; i < shuffledRooms.length - 1; i++) {
      const a = roomCenter(shuffledRooms[i]);
      const b = roomCenter(shuffledRooms[i + 1]);
      // L-shaped corridor
      this._carveHCorridor(grid, a.x, b.x, a.y);
      this._carveVCorridor(grid, a.y, b.y, b.x);
    }

    // ── 4. Place staircase in last room ───────────────────────────────
    const lastRoom = shuffledRooms[shuffledRooms.length - 1];
    const staircase = roomCenter(lastRoom);

    // ── 5. Player start in first room ─────────────────────────────────
    const playerStart = roomCenter(shuffledRooms[0]);

    // ── 6. Place enemies ──────────────────────────────────────────────
    const enemyCount = randInt(2, 4 + Math.floor(floorNumber / 2), rng);
    const enemies = [];
    for (let i = 0; i < enemyCount; i++) {
      // Skip first room (player start)
      const room = shuffledRooms[randInt(1, shuffledRooms.length - 1, rng)];
      enemies.push({
        x: randInt(room.x, room.x + room.w - 1, rng),
        y: randInt(room.y, room.y + room.h - 1, rng),
        type: 'basic', // renderer/spawn system resolves actual species
      });
    }

    // ── 7. Place items ────────────────────────────────────────────────
    const itemCount = randInt(1, 3, rng);
    const items = [];
    for (let i = 0; i < itemCount; i++) {
      const room = shuffledRooms[randInt(1, shuffledRooms.length - 1, rng)];
      items.push({
        x: randInt(room.x, room.x + room.w - 1, rng),
        y: randInt(room.y, room.y + room.h - 1, rng),
        itemId: 'forest_berry', // placeholder; loot table resolved by LootSystem
        qty: 1,
      });
    }

    // ── 8. Write into GameState ───────────────────────────────────────
    state.dungeon.floor = { grid, rooms, staircase, playerStart, enemies, items };
    state.dungeon.currentFloor = floorNumber;

    // Position scouts at player start
    state.dungeon.scout1Pos = { ...playerStart };
    state.dungeon.scout2Pos = { x: playerStart.x + 1, y: playerStart.y };

    // Reveal starting room
    this._revealRoom(grid, shuffledRooms[0]);

    this.game.events.emit('dungeon:floor_generated', {
      floor: floorNumber, branch, rooms, playerStart, staircase,
    });

    return state.dungeon.floor;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  _carveHCorridor(grid, x1, x2, y) {
    const H = grid.length, W = grid[0].length;
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) {
      if (y >= 0 && y < H && x >= 0 && x < W) {
        grid[y][x] = { type: 'corridor', isRevealed: false };
      }
    }
  }

  _carveVCorridor(grid, y1, y2, x) {
    const H = grid.length, W = grid[0].length;
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) {
      if (y >= 0 && y < H && x >= 0 && x < W) {
        grid[y][x] = { type: 'corridor', isRevealed: false };
      }
    }
  }

  _revealRoom(grid, room) {
    const H = grid.length, W = grid[0].length;
    // Reveal room + 1-tile border
    for (let y = room.y - 1; y <= room.y + room.h; y++) {
      for (let x = room.x - 1; x <= room.x + room.w; x++) {
        if (y >= 0 && y < H && x >= 0 && x < W) {
          grid[y][x].isRevealed = true;
        }
      }
    }
  }

  /**
   * Reveal tiles within radius of a position (called when scout moves).
   * @param {{x:number, y:number}} pos
   * @param {number} radius
   */
  revealAround(pos, radius = 3) {
    const { grid } = this.game.state.dungeon.floor;
    if (!grid.length) return;
    const H = grid.length, W = grid[0].length;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = pos.x + dx, ny = pos.y + dy;
        if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
          if (Math.abs(dx) + Math.abs(dy) <= radius) {
            grid[ny][nx].isRevealed = true;
          }
        }
      }
    }
  }
}

function roomCenter(room) {
  return {
    x: Math.floor(room.x + room.w / 2),
    y: Math.floor(room.y + room.h / 2),
  };
}

