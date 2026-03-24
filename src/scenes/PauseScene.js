import Phaser from 'phaser';

/**
 * PauseScene — overlay launched on top of BaseScene or DungeonScene.
 * Pauses the SystemManager while active.
 */
export class PauseScene extends Phaser.Scene {
  constructor() { super({ key: 'PauseScene' }); }

  create() {
    this._events  = this.registry.get('events');
    this._systems = this.registry.get('systemManager');

    this._systems?.pause();

    const W = this.scale.width;
    const H = this.scale.height;

    // Dim overlay
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6)
      .setInteractive(); // blocks input to scenes below

    // Card
    this.add.rectangle(W / 2, H / 2, 240, 300, 0x0d1020)
      .setStrokeStyle(1, 0x3355aa);

    this.add.text(W / 2, H / 2 - 110, 'PAUSED', {
      fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    this._makeBtn(W / 2, H / 2 - 50,  'Resume',    () => this._resume());
    this._makeBtn(W / 2, H / 2,        'Save',      () => this._save());
    this._makeBtn(W / 2, H / 2 + 60,  'Main Menu', () => this._mainMenu());
  }

  _resume() {
    this._systems?.resume();
    this.scene.stop();
  }

  _save() {
    const saveSystem = this._systems?.getSystem('SaveSystem');
    saveSystem?.save(0);
    const W = this.scale.width;
    const msg = this.add.text(W / 2, this.scale.height / 2 + 120, 'Saved!', {
      fontSize: '12px', color: '#44ff88',
    }).setOrigin(0.5);
    this.time.delayedCall(1200, () => msg.destroy());
  }

  _mainMenu() {
    this._systems?.resume(); // resume before stopping so systems don't stay frozen
    this.scene.stop('PauseScene');
    this.scene.stop('BaseScene');
    this.scene.stop('DungeonScene');
    this.scene.stop('UIScene');
    this.scene.start('MainMenuScene');
  }

  _makeBtn(x, y, label, cb) {
    const bg = this.add.rectangle(x, y, 160, 40, 0x1a2a4a)
      .setStrokeStyle(1, 0x3355aa)
      .setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, { fontSize: '13px', color: '#aaccff' }).setOrigin(0.5);
    bg.on('pointerover', () => bg.setFillStyle(0x2a3a6a));
    bg.on('pointerout',  () => bg.setFillStyle(0x1a2a4a));
    bg.on('pointerup',   cb);
  }
}

