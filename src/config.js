import Phaser from 'phaser';
import { BootScene }     from './scenes/BootScene.js';
import { PreloadScene }  from './scenes/PreloadScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { BaseScene }     from './scenes/BaseScene.js';
import { DungeonScene }  from './scenes/DungeonScene.js';
import { UIScene }       from './scenes/UIScene.js';
import { PauseScene }    from './scenes/PauseScene.js';

export const GAME_WIDTH  = 390;
export const GAME_HEIGHT = 844;

export const config = {
  type: Phaser.AUTO,
  width:  GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0a0a1a',
  parent: document.body,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    BaseScene,
    DungeonScene,
    UIScene,
    PauseScene,
  ],
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
};

