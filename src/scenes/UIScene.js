import Phaser from 'phaser';
import { HUD } from '../ui/panels/HUD.js';

/**
 * UIScene — always running in parallel with BaseScene or DungeonScene.
 * Owns the HUD and all panel overlays.
 * Never calls systems — only listens to events and emits UI events.
 */
export class UIScene extends Phaser.Scene {
  constructor() { super({ key: 'UIScene' }); }

  create() {
    this._events = this.registry.get('events');
    this._state  = this.registry.get('gameState');

    // ── HUD ───────────────────────────────────────────────────────────────
    this._hud = new HUD(this, this._events);

    // Kick off initial meter display
    if (this._state) {
      this._events.emit('state:meters_changed', {
        energy:    this._state.energy,
        energyCap: this._state.energyCap,
        hunger:    this._state.hunger,
        thirst:    this._state.thirst,
        warmth:    this._state.warmth,
        hp:        this._state.hp,
      });
      this._events.emit('state:day_changed', { day: this._state.day });
      this._events.emit('weather:changed', { from: null, to: this._state.weather });
    }

    // ── Panel listeners ───────────────────────────────────────────────────
    this._events.on('ui:open_panel',  ({ panel }) => this._openPanel(panel));
    this._events.on('ui:close_panel', ({ panel }) => this._closePanel(panel));

    /** @type {Map<string, Phaser.GameObjects.Container>} */
    this._panels = new Map();

    console.log('[UIScene] Running.');
  }

  // ── Panel management ──────────────────────────────────────────────────────

  _openPanel(name) {
    if (this._panels.has(name)) return; // already open

    let container;
    switch (name) {
      case 'inventory': container = this._buildInventoryPanel(); break;
      case 'roster':    container = this._buildRosterPanel();    break;
      case 'base':      container = this._buildBasePlaceholder(); break;
      default:
        console.warn('[UIScene] Unknown panel:', name);
        return;
    }
    this._panels.set(name, container);
  }

  _closePanel(name) {
    const panel = this._panels.get(name);
    if (panel) { panel.destroy(); this._panels.delete(name); }
  }

  _closeAllPanels() {
    this._panels.forEach(p => p.destroy());
    this._panels.clear();
  }

  // ── Panels ────────────────────────────────────────────────────────────────

  _buildInventoryPanel() {
    const W   = this.scale.width;
    const H   = this.scale.height;
    const c   = this.add.container(0, 0).setDepth(50);
    const inv = this._state?.inventory || {};

    // Dim background
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7)
      .setInteractive();
    c.add(dim);

    // Panel card
    const card = this.add.rectangle(W / 2, H / 2, W - 24, H - 100, 0x0d1020)
      .setStrokeStyle(1, 0x3355aa);
    c.add(card);

    c.add(this.add.text(W / 2, 76, '🎒 INVENTORY', {
      fontSize: '13px', color: '#aaccff', fontStyle: 'bold',
    }).setOrigin(0.5));

    // Item list
    const items = Object.entries(inv);
    if (items.length === 0) {
      c.add(this.add.text(W / 2, H / 2, '(empty)', {
        fontSize: '12px', color: '#556677',
      }).setOrigin(0.5));
    } else {
      items.forEach(([id, qty], i) => {
        const row = this.add.text(30, 100 + i * 22, `${id}  ×${qty}`, {
          fontSize: '11px', color: '#99bbdd',
        });
        c.add(row);
      });
    }

    // Close button
    const closeBtn = this.add.text(W - 18, 72, '✕', {
      fontSize: '16px', color: '#ff6644',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerup', () => this._closePanel('inventory'));
    c.add(closeBtn);

    dim.on('pointerup', () => this._closePanel('inventory'));

    return c;
  }

  _buildRosterPanel() {
    const W = this.scale.width;
    const H = this.scale.height;
    const c = this.add.container(0, 0).setDepth(50);

    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setInteractive();
    c.add(dim);

    const card = this.add.rectangle(W / 2, H / 2, W - 24, H - 80, 0x0d1020)
      .setStrokeStyle(1, 0x3355aa);
    c.add(card);

    c.add(this.add.text(W / 2, 76, '👥 ROSTER', {
      fontSize: '13px', color: '#aaccff', fontStyle: 'bold',
    }).setOrigin(0.5));

    const entities = this.registry.get('entityManager');
    const scouts   = entities?.queryTag('scout') || [];
    const pokemon  = entities?.queryTag('pokemon') || [];

    const all = [...new Set([...scouts, ...pokemon])];

    if (all.length === 0) {
      c.add(this.add.text(W / 2, H / 2, 'No Pokémon recruited yet.', {
        fontSize: '11px', color: '#556677',
      }).setOrigin(0.5));
    } else {
      all.forEach((p, i) => {
        const hp  = p._components.get('HealthComponent');
        const hpStr = hp ? `HP ${hp.current}/${hp.max}` : '';
        const row = this.add.text(20, 100 + i * 28,
          `${p.displayName || p.name}  ${hpStr}  [${p.roleAffinity}]`, {
          fontSize: '11px', color: '#99bbdd',
        });
        c.add(row);
      });
    }

    const closeBtn = this.add.text(W - 18, 72, '✕', {
      fontSize: '16px', color: '#ff6644',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerup', () => this._closePanel('roster'));
    c.add(closeBtn);
    dim.on('pointerup', () => this._closePanel('roster'));

    return c;
  }

  _buildBasePlaceholder() {
    const W = this.scale.width;
    const H = this.scale.height;
    const c = this.add.container(0, 0).setDepth(50);

    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setInteractive();
    c.add(dim);

    c.add(this.add.text(W / 2, H / 2, '🏠 Base panel\n(coming soon)', {
      fontSize: '13px', color: '#aaccff', align: 'center',
    }).setOrigin(0.5));

    dim.on('pointerup', () => this._closePanel('base'));
    return c;
  }

  shutdown() {
    this._hud?.destroy();
    this._closeAllPanels();
    this._events?.off('ui:open_panel');
    this._events?.off('ui:close_panel');
  }
}

