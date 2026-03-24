import Phaser from 'phaser';
import { config } from './config.js';

const game = new Phaser.Game(config);

// Expose for sandbox/debugging in dev only
if (import.meta.env.DEV) {
  window.__game = game;
}
