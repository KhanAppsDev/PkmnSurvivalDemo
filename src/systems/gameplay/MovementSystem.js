import { inBounds } from '../../utils/grid.js';

/**
 * MovementSystem — moves the player on the island grid and scouts in the dungeon.
 */
export class MovementSystem {
  constructor(game) {
    this.game   = game;
    this.active = true;

    const ev = game.events;
    ev.on('action:move_player',  (d) => this._movePlayer(d.tile));
    ev.on('action:scout_move',   (d) => this._moveScout(d.scoutId, d.dx, d.dy));
    ev.on('action:scout_retreat',(  ) => this._retreat());
  }

  update(_delta) { /* event-driven */ }

  // ── Day phase ────────────────────────────────────────────────────────────

  _movePlayer(tile) {
    const state = this.game.state;
    if (state.energy <= 0) return;

    const t = state.getTile(tile.x, tile.y);
    if (!t || t.isLocked) return;

    state.playerX = tile.x;
    state.playerY = tile.y;

    // Reveal this tile
    t.isRevealed = true;

    // Reveal neighbours
    const neighbours = [
      { x: tile.x - 1, y: tile.y }, { x: tile.x + 1, y: tile.y },
      { x: tile.x, y: tile.y - 1 }, { x: tile.x, y: tile.y + 1 },
    ];
    for (const n of neighbours) {
      if (inBounds(n.x, n.y)) {
        const nt = state.getTile(n.x, n.y);
        if (nt) nt.isRevealed = true;
      }
    }

    this.game.events.emit('state:player_moved', { tile });
    // EnergySystem handles energy deduction via its own listener
    this.game.events.emit('action:move_player_energy', {});
  }

  // ── Night phase ──────────────────────────────────────────────────────────

  _moveScout(scoutId, dx, dy) {
    const state  = this.game.state;
    const posKey = scoutId === 1 ? 'scout1Pos' : 'scout2Pos';
    const pos    = state.dungeon[posKey];
    const floor  = state.dungeon.floor;

    if (!floor.grid.length) return;

    const nx = pos.x + dx;
    const ny = pos.y + dy;
    const H  = floor.grid.length;
    const W  = floor.grid[0].length;

    if (nx < 0 || nx >= W || ny < 0 || ny >= H) return;

    const cell = floor.grid[ny][nx];
    if (cell.type === 'wall') return;

    // Check for enemy at target cell → trigger combat instead of moving
    const enemy = this._enemyAt(nx, ny);
    if (enemy) {
      this.game.events.emit('combat:bump_attack', { attackerScoutId: scoutId, targetEntityId: enemy.id });
      return;
    }

    // Move
    pos.x = nx;
    pos.y = ny;

    // Reveal around new position
    this.game.systems.getSystem('DungeonGenerator')?.revealAround(pos);

    // Check staircase
    const stair = floor.staircase;
    if (stair && nx === stair.x && ny === stair.y) {
      this.game.events.emit('dungeon:staircase_reached', {});
    }

    this.game.events.emit('state:scout_moved', { scoutId, pos: { x: nx, y: ny } });
  }

  _enemyAt(x, y) {
    return this.game.entities.queryTag('enemy').find(e => {
      const move = e._components?.get('MovementComponent');
      return move && move.x === x && move.y === y;
    });
  }

  _retreat() {
    const state = this.game.state;
    state.dungeon.runActive = false;
    state.dungeon.runResult = 'retreat';
    this.game.events.emit('dungeon:run_ended', {
      result: 'retreat',
      loot: state.dungeon.pendingLoot,
    });
  }
}

