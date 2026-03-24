import Phaser from 'phaser';
import { EventSystem }  from '../systems/effects/EventSystem.js';
import { DataManager }  from '../systems/persistence/DataManager.js';

/**
 * BootScene — runs once at launch.
 * Creates the shared EventSystem and DataManager, then moves to PreloadScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    // Nothing to load — PreloadScene handles all assets.
  }

  create() {
    // Attach EventSystem to registry so every scene and system can access it
    const events = new EventSystem();
    this.registry.set('events', events);

    // DataManager holds sprite URL cache across sessions
    const dataManager = new DataManager();
    this.registry.set('dataManager', dataManager);

    console.log('[BootScene] Initialised. Moving to PreloadScene.');
    this.scene.start('PreloadScene');
  }
}

