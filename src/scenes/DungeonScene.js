import Phaser from 'phaser';
import { DUNGEON_TILE } from '../utils/grid.js';
import { DUNGEON_COLORS } from '../data/biomes.js';
import { DPad } from '../ui/controls/DPad.js';
import { POKEMON_BY_ID, DEMO_SCOUT_IDS } from '../data/pokemon.js';
import { PokemonInstance } from '../entities/PokemonInstance.js';

/**
 * DungeonScene — the night phase.
 * Renders the dungeon floor grid, two scout sprites, enemies.
 * Forwards D-pad + move button input to EventSystem.
 * Calls SystemManager.update() every frame.
 */
export class DungeonScene extends Phaser.Scene {
  constructor() { super({ key: 'DungeonScene' }); }

  create() {
    this._events  = this.registry.get('events');
    this._state   = this.registry.get('gameState');
    this._systems = this.registry.get('systemManager');
    this._entities = this.registry.get('entityManager');

    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    this.add.rectangle(W / 2, H / 2, W, H, 0x05050f);

    // ── Generate floor ────────────────────────────────────────────────────
    const gen = this._systems.getSystem('DungeonGenerator');
    gen.generateFloor(1, 'rootweb_hollow');

    // Grid display — centred below the HUD (56px top strip)
    // Dungeon grid is 24×20 tiles × 24px = 576×480 — bigger than screen.
    // We'll scroll/clip. For demo: render from (0,0) with camera offset.
    this._dungeonGraphics = this.add.graphics().setDepth(1);
    this._floorOffX = Math.floor((W - 24 * DUNGEON_TILE) / 2);
    this._floorOffY = 58;
    this._drawFloor();

    // ── Spawn scout entities ──────────────────────────────────────────────
    this._spawnScouts();

    // ── Scout sprites ─────────────────────────────────────────────────────
    this._scout1Sprite = this._makeScoutSprite(1);
    this._scout2Sprite = this._makeScoutSprite(2);
    this._updateScoutSprites();

    // ── Enemy sprites ─────────────────────────────────────────────────────
    this._enemySprites = new Map();
    this._spawnEnemySprites();

    // ── Staircase label ───────────────────────────────────────────────────
    this._staircaseGraphic = this._drawStaircase();

    // ── D-Pad ─────────────────────────────────────────────────────────────
    this._dpad = new DPad(this, this._events, {
      x: 75,
      y: H - 85,
      size: 50,
    });

    // ── Move buttons ──────────────────────────────────────────────────────
    this._buildMoveButtons();

    // ── Retreat button ────────────────────────────────────────────────────
    this._buildRetreatButton();

    // ── Event subscriptions ───────────────────────────────────────────────
    this._onScoutMoved   = () => { this._updateScoutSprites(); this._drawFloor(); };
    this._onRunEnded     = (d) => this._handleRunEnded(d);
    this._onCombatHit    = (d) => this._onHit(d);
    this._onFloorAdvance = ()  => this._advanceFloor();

    this._events.on('state:scout_moved',       this._onScoutMoved);
    this._events.on('dungeon:run_ended',        this._onRunEnded);
    this._events.on('combat:bump_attack',       this._onCombatBump.bind(this));
    this._events.on('dungeon:staircase_reached',this._onFloorAdvance);

    // Mark run active
    this._state.dungeon.runActive = true;
    this._events.emit('player:dungeon_start', {});

    console.log('[DungeonScene] Floor 1 ready.');
  }

  update(_time, delta) {
    this._systems?.update(delta);
  }

  // ── Floor rendering ───────────────────────────────────────────────────────

  _drawFloor() {
    const g     = this._dungeonGraphics;
    const floor = this._state.dungeon.floor;
    if (!floor.grid.length) return;
    g.clear();

    const ox = this._floorOffX;
    const oy = this._floorOffY;
    const ts = DUNGEON_TILE;

    for (let y = 0; y < floor.grid.length; y++) {
      for (let x = 0; x < floor.grid[y].length; x++) {
        const cell = floor.grid[y][x];
        const wx   = ox + x * ts;
        const wy   = oy + y * ts;

        if (!cell.isRevealed) {
          // Full fog
          g.fillStyle(DUNGEON_COLORS.fog, 1);
          g.fillRect(wx, wy, ts, ts);
          continue;
        }

        const col = DUNGEON_COLORS[cell.type] ?? DUNGEON_COLORS.floor;
        g.fillStyle(col, 1);
        g.fillRect(wx, wy, ts, ts);

        // Subtle grid line on floor/corridor tiles
        if (cell.type !== 'wall') {
          g.lineStyle(0.5, 0x1a1a30, 0.4);
          g.strokeRect(wx, wy, ts, ts);
        }
      }
    }

    // Staircase marker
    const stair = floor.staircase;
    if (stair && floor.grid[stair.y]?.[stair.x]?.isRevealed) {
      g.fillStyle(DUNGEON_COLORS.staircase, 0.9);
      const margin = 4;
      g.fillRect(ox + stair.x * ts + margin, oy + stair.y * ts + margin, ts - margin * 2, ts - margin * 2);
    }
  }

  // ── Scout management ──────────────────────────────────────────────────────

  _spawnScouts() {
    const entityMgr = this._entities;
    const state     = this._state;

    // Clear previous scout entities
    if (state.dungeon.scout1EntityId) entityMgr.destroy(state.dungeon.scout1EntityId);
    if (state.dungeon.scout2EntityId) entityMgr.destroy(state.dungeon.scout2EntityId);

    const [id1, id2] = DEMO_SCOUT_IDS; // 158=Totodile, 403=Shinx
    const spec1 = POKEMON_BY_ID[id1];
    const spec2 = POKEMON_BY_ID[id2];

    const scout1 = entityMgr.create(PokemonInstance, spec1);
    const scout2 = entityMgr.create(PokemonInstance, spec2);
    scout1.tags.add('scout');
    scout2.tags.add('scout');

    // Set starting positions from generated floor
    const s1m = scout1._components.get('MovementComponent');
    const s2m = scout2._components.get('MovementComponent');
    if (s1m) { s1m.x = state.dungeon.scout1Pos.x; s1m.y = state.dungeon.scout1Pos.y; }
    if (s2m) { s2m.x = state.dungeon.scout2Pos.x; s2m.y = state.dungeon.scout2Pos.y; }

    state.dungeon.scout1EntityId = scout1.id;
    state.dungeon.scout2EntityId = scout2.id;

    // Assign texture keys based on loaded sprites
    const dm = this.registry.get('dataManager');
    scout1.textureKey = dm.getSpriteKey(id1);
    scout1.animKey    = `walk_${id1}`;
    scout2.textureKey = dm.getSpriteKey(id2);
    scout2.animKey    = `walk_${id2}`;
  }

  _makeScoutSprite(scoutNum) {
    const state    = this._state;
    const entityId = scoutNum === 1 ? state.dungeon.scout1EntityId : state.dungeon.scout2EntityId;
    const entity   = this._entities.get(entityId);

    const pos = scoutNum === 1 ? state.dungeon.scout1Pos : state.dungeon.scout2Pos;
    const wx  = this._floorOffX + pos.x * DUNGEON_TILE + DUNGEON_TILE / 2;
    const wy  = this._floorOffY + pos.y * DUNGEON_TILE + DUNGEON_TILE / 2;

    const key = entity?.textureKey;

    if (key && this.textures.exists(key) && !key.startsWith('fallback')) {
      const sprite = this.add.sprite(wx, wy, key).setDepth(5);
      // Scale sprite to fit in dungeon tile
      const tex   = this.textures.get(key);
      const frame = tex.frames[0];
      if (frame) {
        const scale = (DUNGEON_TILE - 4) / Math.max(frame.realWidth, frame.realHeight);
        sprite.setScale(scale);
      }
      const animKey = entity?.animKey;
      if (animKey && this.anims.exists(animKey)) {
        sprite.play(animKey);
      }
      return sprite;
    }

    // Fallback coloured rectangle
    const col = scoutNum === 1 ? 0x44ff88 : 0x4488ff;
    return this.add.rectangle(wx, wy, DUNGEON_TILE - 6, DUNGEON_TILE - 6, col).setDepth(5);
  }

  _updateScoutSprites() {
    const state = this._state;

    const updateOne = (sprite, pos) => {
      if (!sprite) return;
      const wx = this._floorOffX + pos.x * DUNGEON_TILE + DUNGEON_TILE / 2;
      const wy = this._floorOffY + pos.y * DUNGEON_TILE + DUNGEON_TILE / 2;
      this.tweens.add({ targets: sprite, x: wx, y: wy, duration: 100, ease: 'Linear' });
    };

    updateOne(this._scout1Sprite, state.dungeon.scout1Pos);
    updateOne(this._scout2Sprite, state.dungeon.scout2Pos);
  }

  // ── Enemy spawning ────────────────────────────────────────────────────────

  _spawnEnemySprites() {
    const floor = this._state.dungeon.floor;
    for (const enemy of (floor.enemies || [])) {
      const wx = this._floorOffX + enemy.x * DUNGEON_TILE + DUNGEON_TILE / 2;
      const wy = this._floorOffY + enemy.y * DUNGEON_TILE + DUNGEON_TILE / 2;
      const sprite = this.add.rectangle(wx, wy, DUNGEON_TILE - 8, DUNGEON_TILE - 8, 0xff4444).setDepth(4);
      // Mark with small dot
      const dot = this.add.circle(wx + 5, wy - 5, 3, 0xffff00).setDepth(5);
      this._enemySprites.set(`${enemy.x},${enemy.y}`, { sprite, dot });
    }
  }

  _drawStaircase() {
    // Drawn in _drawFloor via graphics — nothing additional needed
  }

  // ── Move buttons ──────────────────────────────────────────────────────────

  _buildMoveButtons() {
    const state  = this._state;
    const entity = this._entities.get(state.dungeon.scout1EntityId);
    const atk    = entity?._components.get('AttackComponent');
    const moves  = atk?.moves ?? [];

    const W    = this.scale.width;
    const y    = this.scale.height - 85;
    const btnW = 70;
    const btnH = 44;
    const startX = W - btnW * 3 - 10;

    this._moveBtns = [];

    moves.slice(0, 3).forEach((move, i) => {
      const x = startX + i * (btnW + 4) + btnW / 2;
      const label = move.verb.length > 6 ? move.verb.slice(0, 6) : move.verb;
      const ppTxt = move.context.includes('combat') ? `\n${move.pp}/${move.maxPP}PP` : '\n(day)';

      const bg = this.add.rectangle(x, y, btnW, btnH, 0x1a1a3a)
        .setStrokeStyle(1, 0x3344aa)
        .setInteractive({ useHandCursor: true })
        .setDepth(20);

      const txt = this.add.text(x, y - 2, label + ppTxt, {
        fontSize: '9px', color: '#99aaff', align: 'center',
      }).setOrigin(0.5).setDepth(21);

      // Disable non-combat moves in dungeon
      if (!move.context.includes('combat')) {
        bg.setFillStyle(0x111122).setAlpha(0.5);
        txt.setAlpha(0.4);
      } else {
        bg.on('pointerup', () => {
          this._events.emit('input:move_button', { moveIndex: i });
        });
        bg.on('pointerover', () => bg.setFillStyle(0x2a2a5a));
        bg.on('pointerout',  () => bg.setFillStyle(0x1a1a3a));
      }

      this._moveBtns.push({ bg, txt, move });
    });
  }

  _buildRetreatButton() {
    const W = this.scale.width;
    const y = 30; // Top centre area, below HUD

    const bg = this.add.rectangle(W / 2, y, 90, 26, 0x2a0a0a)
      .setStrokeStyle(1, 0x884422)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);

    this.add.text(W / 2, y, '↩ Retreat', {
      fontSize: '10px', color: '#ff8866',
    }).setOrigin(0.5).setDepth(21);

    bg.on('pointerup',   () => this._events.emit('input:retreat'));
    bg.on('pointerover', () => bg.setFillStyle(0x440a0a));
    bg.on('pointerout',  () => bg.setFillStyle(0x2a0a0a));
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  _onCombatBump({ attackerScoutId, targetEntityId }) {
    // Simple damage flash for demo — full CombatSystem to be implemented
    const enemy = this._entities.get(targetEntityId);
    if (!enemy) return;

    const hp = enemy._components.get('HealthComponent');
    if (hp) hp.damage(15);

    if (hp?.isDead) {
      // Remove enemy sprite
      const m = enemy._components.get('MovementComponent');
      const key = m ? `${m.x},${m.y}` : null;
      if (key && this._enemySprites.has(key)) {
        const { sprite, dot } = this._enemySprites.get(key);
        sprite.destroy();
        dot?.destroy();
        this._enemySprites.delete(key);
      }
      this._entities.destroy(targetEntityId);
      this._events.emit('combat:faint', { entityId: targetEntityId, isEnemy: true });
    }

    this._events.emit('combat:hit', { attackerScoutId, targetEntityId, damage: 15 });
  }

  _onHit(_data) {
    // Camera shake on hit
    this.cameras.main.shake(80, 0.004);
    this._events.emit('state:scout_moved', {}); // refresh HUD cooldown bars
  }

  _advanceFloor() {
    const floor = this._state.dungeon.currentFloor;
    const gen   = this._systems.getSystem('DungeonGenerator');

    // Flash transition
    this.cameras.main.flash(300, 255, 255, 255, false, (_c, progress) => {
      if (progress === 1) {
        gen.generateFloor(floor + 1, 'rootweb_hollow');
        this._spawnScouts();

        // Destroy old sprites and re-create
        this._scout1Sprite?.destroy();
        this._scout2Sprite?.destroy();
        this._enemySprites.forEach(({ sprite, dot }) => { sprite.destroy(); dot?.destroy(); });
        this._enemySprites.clear();

        this._scout1Sprite = this._makeScoutSprite(1);
        this._scout2Sprite = this._makeScoutSprite(2);
        this._spawnEnemySprites();
        this._drawFloor();

        const newFloor = this._state.dungeon.currentFloor;
        this._events.emit('dungeon:floor_generated', { floor: newFloor });
      }
    });
  }

  _handleRunEnded({ result, loot }) {
    this._state.dungeon.runActive = false;

    // Commit loot to player inventory
    for (const { itemId, qty } of (loot || [])) {
      this._state.addItem(itemId, qty);
    }
    this._state.dungeon.pendingLoot = [];

    // Advance day
    const timeSys = this._systems.getSystem('TimeSystem');
    timeSys?.newDay();

    // Restore player energy
    this._state.energy = this._state.energyCap;
    this._state._emitMeters?.();

    this._events.emit('player:dungeon_end', {});

    // Transition back to day
    this.cameras.main.fade(400, 0, 0, 0, false, (_c, progress) => {
      if (progress === 1) {
        this.scene.stop();
        this.scene.start('BaseScene');
      }
    });
  }

  shutdown() {
    this._events?.off('state:scout_moved',        this._onScoutMoved);
    this._events?.off('dungeon:run_ended',         this._onRunEnded);
    this._events?.off('dungeon:staircase_reached', this._onFloorAdvance);
    this._dpad?.destroy();
  }
}

