/**
 * SceneManager — named transitions that know the game's flow rules.
 * Wraps Phaser's scene plugin so systems/scenes don't call Phaser APIs directly.
 */
export class SceneManager {
  /** @param {Phaser.Scenes.ScenePlugin} phaserScene */
  constructor(phaserScene) {
    this._s = phaserScene;
  }

  /** Day → Dusk assignment panel (BaseScene stays running underneath). */
  openDuskScreen() {
    this._s.launch('DuskScreen');
  }

  /** Dusk confirmed → stop Base, start Dungeon. UIScene keeps running. */
  goToNight() {
    this._s.stop('BaseScene');
    this._s.start('DungeonScene');
  }

  /** Dungeon run ended → stop Dungeon, show Dawn resolution, start Base. */
  goToDawn() {
    this._s.stop('DungeonScene');
    this._s.start('BaseScene');
    this._s.launch('DawnScreen');
  }

  /** Return to main menu from anywhere. */
  goToMainMenu() {
    ['BaseScene', 'DungeonScene', 'UIScene', 'PauseScene'].forEach(key => {
      if (this._s.isActive(key)) this._s.stop(key);
    });
    this._s.start('MainMenuScene');
  }

  /** Pause overlay. */
  openPause() {
    this._s.launch('PauseScene');
  }

  closePause() {
    this._s.stop('PauseScene');
  }
}


