import Phaser from 'phaser';
import { TILE_SIZE, tileToScreen, screenToTile } from '../utils/grid.js';
import { BIOMES } from '../data/biomes.js';

/**
 * BaseScene — the day phase.
 * Renders the 10×10 island grid, player, and structures.
 * Forwards pointer input to InputSystem via EventSystem.
 * Calls SystemManager.update() every frame.
 */
export class BaseScene extends Phaser.Scene {
  constructor() { super({ key: 'BaseScene' }); }

  create() {
    this._events  = this.registry.get('events');
    this._state   = this.registry.get('gameState');
    this._systems = this.registry.get('systemManager');

    const W = this.scale.width;
    const H = this.scale.height;

    // ── Background ────────────────────────────────────────────────────────
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d1a10);

    // ── Grid offset — centre the 10×10 grid horizontally ─────────────────
    // Grid = 10 × 36 = 360px wide. On 390px screen → 15px left margin.
    this._gridOffX = Math.floor((W - 10 * TILE_SIZE) / 2);
    this._gridOffY = 52; // below HUD strip

    // ── Draw tiles ────────────────────────────────────────────────────────
    this._tileGraphics = this.add.graphics();
    this._drawTiles();

    // ── Player sprite ─────────────────────────────────────────────────────
    const startScreen = this._tileToWorld(this._state.playerX, this._state.playerY);
    this._playerSprite = this.add.rectangle(
      startScreen.x, startScreen.y, 20, 20, 0xffffff
    ).setDepth(10);

    // Small dot to indicate facing direction
    this._playerDot = this.add.circle(startScreen.x, startScreen.y - 6, 3, 0x88aaff).setDepth(11);

    // ── Sleep button (visible at dusk / low energy) ───────────────────────
    this._buildSleepButton();

    // ── Bag / Roster button strip ─────────────────────────────────────────
    this._buildBottomBar();

    // ── Input ─────────────────────────────────────────────────────────────
    this.input.on('pointerup', (ptr) => {
      // Convert screen tap to tile, accounting for grid offset
      const gx = ptr.x - this._gridOffX;
      const gy = ptr.y - this._gridOffY;
      const tile = screenToTile(gx, gy, TILE_SIZE);
      if (tile.x >= 0 && tile.x < 10 && tile.y >= 0 && tile.y < 10) {
        this._events.emit('input:tile_tapped', { tile });
      }
    });

    // ── Event subscriptions ───────────────────────────────────────────────
    this._onPlayerMoved = () => this._updatePlayerSprite();
    this._onTilesChanged = () => this._drawTiles();
    this._onGoToSleep = () => this._startNight();
    this._onEnergyDepleted = () => this._startNight();

    this._events.on('state:player_moved',  this._onPlayerMoved);
    this._events.on('state:structures_changed', this._onTilesChanged);
    this._events.on('action:go_to_sleep',  this._onGoToSleep);
    this._events.on('survival:energy_depleted', this._onEnergyDepleted);
    this._events.on('time:segment_changed', ({ segment }) => {
      if (segment === 'dusk') this._sleepBtn?.setVisible(true);
    });

    console.log('[BaseScene] Ready. Day', this._state.day);
  }

  update(_time, delta) {
    this._systems?.update(delta);
  }

  // ── Private ───────────────────────────────────────────────────────────────

  _drawTiles() {
    const g     = this._tileGraphics;
    const state = this._state;
    g.clear();

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const tile  = state.getTile(x, y);
        const wx    = this._gridOffX + x * TILE_SIZE;
        const wy    = this._gridOffY + y * TILE_SIZE;
        const biome = BIOMES[tile.biome] || BIOMES.forest_floor;

        if (!tile.isRevealed) {
          // Fog of war
          g.fillStyle(0x050508, 1);
          g.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);
          continue;
        }

        // Tile fill
        g.fillStyle(biome.tileColor, 1);
        g.fillRect(wx, wy, TILE_SIZE, TILE_SIZE);

        // Tile border
        g.lineStyle(1, biome.borderColor || 0x000000, 0.5);
        g.strokeRect(wx, wy, TILE_SIZE, TILE_SIZE);

        // Resource node indicator
        if (tile.resourceNode) {
          g.fillStyle(0xffff88, 0.7);
          g.fillCircle(wx + TILE_SIZE / 2, wy + TILE_SIZE / 2, 4);
        }

        // Structure indicator
        if (tile.structure) {
          g.fillStyle(0xaaaaff, 0.8);
          g.fillRect(wx + 8, wy + 8, TILE_SIZE - 16, TILE_SIZE - 16);
        }
      }
    }

    // Player tile highlight
    const px = this._gridOffX + state.playerX * TILE_SIZE;
    const py = this._gridOffY + state.playerY * TILE_SIZE;
    g.lineStyle(2, 0xffffff, 0.6);
    g.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
  }

  _updatePlayerSprite() {
    const pos = this._tileToWorld(this._state.playerX, this._state.playerY);
    this._playerSprite?.setPosition(pos.x, pos.y);
    this._playerDot?.setPosition(pos.x, pos.y - 8);
  }

  _tileToWorld(tx, ty) {
    const s = tileToScreen(tx, ty, TILE_SIZE);
    return { x: this._gridOffX + s.x, y: this._gridOffY + s.y };
  }

  _buildSleepButton() {
    const W = this.scale.width;
    const y = this.scale.height - 55;

    this._sleepBtnBg = this.add.rectangle(W / 2, y, 180, 44, 0x1a1a3a)
      .setStrokeStyle(1, 0x4455cc)
      .setInteractive({ useHandCursor: true })
      .setVisible(false)
      .setDepth(20);

    this._sleepBtnTxt = this.add.text(W / 2, y, '🌙  Settle In', {
      fontSize: '14px', color: '#aaccff',
    }).setOrigin(0.5).setVisible(false).setDepth(21);

    this._sleepBtnBg.on('pointerup', () => this._events.emit('input:sleep_button'));
    this._sleepBtnBg.on('pointerover',  () => this._sleepBtnBg.setFillStyle(0x2a2a5a));
    this._sleepBtnBg.on('pointerout',   () => this._sleepBtnBg.setFillStyle(0x1a1a3a));

    this._sleepBtn = { setVisible: (v) => {
      this._sleepBtnBg.setVisible(v);
      this._sleepBtnTxt.setVisible(v);
    }};

    // Show immediately if energy already low (e.g. loaded save)
    if (this._state.energy <= 10 || this._state.segment === 'dusk') {
      this._sleepBtn.setVisible(true);
    }
  }

  _buildBottomBar() {
    const W = this.scale.width;
    const y = this.scale.height - 14;
    const labels = [
      { label: '🎒 Bag',   id: 'inventory' },
      { label: '🏠 Base',  id: 'base' },
      { label: '👥 Mons',  id: 'roster' },
    ];
    const bw = 100;
    const startX = (W - bw * labels.length) / 2 + bw / 2;

    labels.forEach(({ label, id }, i) => {
      const x = startX + i * bw;
      const bg = this.add.rectangle(x, y, bw - 4, 24, 0x111122, 0.85)
        .setStrokeStyle(1, 0x334466)
        .setInteractive({ useHandCursor: true })
        .setDepth(20);
      this.add.text(x, y, label, { fontSize: '10px', color: '#8899bb' })
        .setOrigin(0.5).setDepth(21);
      bg.on('pointerup', () => this._events.emit('input:panel_button', { buttonId: id }));
    });
  }

  _startNight() {
    // Freeze player input
    this.input.off('pointerup');

    // Brief flash before transitioning
    this.cameras.main.flash(400, 0, 0, 30, false, (_cam, progress) => {
      if (progress === 1) {
        this._events.emit('player:dungeon_start', {});
        const sceneMgr = this.registry.get('sceneManager');
        sceneMgr?.goToNight() ?? this._fallbackGoToNight();
      }
    });
  }

  _fallbackGoToNight() {
    this.scene.stop();
    this.scene.start('DungeonScene');
  }

  shutdown() {
    // Clean up event listeners to prevent ghost callbacks
    this._events?.off('state:player_moved',      this._onPlayerMoved);
    this._events?.off('state:structures_changed',this._onTilesChanged);
    this._events?.off('action:go_to_sleep',       this._onGoToSleep);
    this._events?.off('survival:energy_depleted', this._onEnergyDepleted);
  }
}


