import Phaser from 'phaser';
import { Game }           from '../core/Game.js';
import { SystemManager }  from '../core/SystemManager.js';
import { EntityManager }  from '../core/EntityManager.js';
import { SceneManager }   from '../core/SceneManager.js';
import { GameState }      from '../systems/state/GameState.js';
import { InputSystem }    from '../systems/input/InputSystem.js';
import { ActionSystem }   from '../systems/input/ActionSystem.js';
import { MovementSystem } from '../systems/gameplay/MovementSystem.js';
import { EnergySystem }   from '../systems/survival/EnergySystem.js';
import { HungerSystem }   from '../systems/survival/HungerSystem.js';
import { ThirstSystem }   from '../systems/survival/ThirstSystem.js';
import { TemperatureSystem } from '../systems/survival/TemperatureSystem.js';
import { TimeSystem }     from '../systems/world/TimeSystem.js';
import { DungeonGenerator } from '../systems/world/DungeonGenerator.js';
import { SaveSystem }     from '../systems/persistence/SaveSystem.js';

/**
 * MainMenuScene — title screen, new game / load.
 * Also bootstraps all systems — they live on the Phaser registry
 * so they persist across scene transitions.
 */
export class MainMenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MainMenuScene' }); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a);

    // Decorative grid dots
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(10, W - 10);
      const y = Phaser.Math.Between(10, H - 10);
      this.add.circle(x, y, 1, 0x334466, 0.6);
    }

    // Title
    this.add.text(W / 2, 180, "ISLAND'S EDGE", {
      fontSize: '28px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000033', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(W / 2, 218, 'Survive 100 days. Build a way home.', {
      fontSize: '11px', color: '#8899bb',
    }).setOrigin(0.5);

    // Buttons
    this._makeButton(W / 2, 360, 'NEW GAME', () => this._startNewGame());
    this._makeButton(W / 2, 430, 'LOAD GAME', () => this._loadGame());

    // Version
    this.add.text(W - 8, H - 8, 'v0.1.0-M0', {
      fontSize: '9px', color: '#334455',
    }).setOrigin(1, 1);
  }

  // ── Game bootstrap ────────────────────────────────────────────────────────

  _startNewGame() {
    this._bootstrap();
    // Start base + UI in parallel
    this.scene.start('BaseScene');
    this.scene.launch('UIScene');
  }

  _loadGame() {
    this._bootstrap();
    const saveSystem = this.registry.get('systemManager').getSystem('SaveSystem');
    const loaded = saveSystem?.load(0);
    if (loaded) {
      this.scene.start('BaseScene');
      this.scene.launch('UIScene');
    } else {
      // No save found — flash message
      const msg = this.add.text(this.scale.width / 2, 500, 'No save found.', {
        fontSize: '12px', color: '#ff6644',
      }).setOrigin(0.5);
      this.time.delayedCall(1500, () => msg.destroy());
    }
  }

  _bootstrap() {
    // Avoid re-creating if already set up (e.g. returning from game)
    if (this.registry.get('game')) return;

    const events      = this.registry.get('events');
    const gameState   = new GameState(events);
    const entityMgr   = new EntityManager();
    const systemMgr   = new SystemManager();

    // Store on registry
    this.registry.set('gameState',     gameState);
    this.registry.set('entityManager', entityMgr);
    this.registry.set('systemManager', systemMgr);

    // Game wrapper
    const game = new Game(this.registry);
    this.registry.set('game', game);

    // SceneManager
    const sceneMgr = new SceneManager(this.scene);
    this.registry.set('sceneManager', sceneMgr);

    // Register all systems (priority order matches ARCHITECTURE.md)
    systemMgr
      .register('TimeSystem',        new TimeSystem(game),        10)
      .register('InputSystem',       new InputSystem(game),       20)
      .register('ActionSystem',      new ActionSystem(game),      30)
      .register('MovementSystem',    new MovementSystem(game),    40)
      .register('EnergySystem',      new EnergySystem(game),      70)
      .register('HungerSystem',      new HungerSystem(game),      70)
      .register('ThirstSystem',      new ThirstSystem(game),      70)
      .register('TemperatureSystem', new TemperatureSystem(game), 70)
      .register('SaveSystem',        new SaveSystem(game),        150)
      .register('DungeonGenerator',  new DungeonGenerator(game),  999); // on-demand

    systemMgr.initAll();
    console.log('[MainMenu] Systems bootstrapped.');
  }

  // ── UI helpers ────────────────────────────────────────────────────────────

  _makeButton(x, y, label, callback) {
    const bg = this.add.rectangle(x, y, 200, 48, 0x1a2a4a)
      .setStrokeStyle(1, 0x3355aa)
      .setInteractive({ useHandCursor: true });

    const txt = this.add.text(x, y, label, {
      fontSize: '14px', color: '#aaccff', fontStyle: 'bold',
    }).setOrigin(0.5);

    bg.on('pointerover',  () => { bg.setFillStyle(0x2a3a6a); txt.setColor('#ffffff'); });
    bg.on('pointerout',   () => { bg.setFillStyle(0x1a2a4a); txt.setColor('#aaccff'); });
    bg.on('pointerdown',  () => bg.setFillStyle(0x0a1a3a));
    bg.on('pointerup',    callback);
  }
}

