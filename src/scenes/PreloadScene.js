import Phaser from 'phaser';
import { DEMO_SCOUT_IDS } from '../data/pokemon.js';
import { fetchAnimData, getAnimUrl, padId } from '../utils/SpriteLoader.js';
import { TYPE_COLORS } from '../systems/persistence/DataManager.js';

/**
 * PreloadScene — loading screen.
 * Fetches PMD sprite sheets for the demo scouts (Totodile + Shinx).
 * Shows a simple progress bar while loading.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: 'PreloadScene' }); }

  preload() {
    // Static placeholder assets (tiny inline data URIs so the build needs no files)
    // In production replace with actual file loads from /assets/
  }

  async create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── Loading screen ────────────────────────────────────────────────────
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a);

    const title = this.add.text(W / 2, H / 2 - 60, "ISLAND'S EDGE", {
      fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    const status = this.add.text(W / 2, H / 2, 'Loading sprites…', {
      fontSize: '12px', color: '#aaaaaa',
    }).setOrigin(0.5);

    const barBg   = this.add.rectangle(W / 2, H / 2 + 30, 200, 12, 0x333333);
    const barFill = this.add.rectangle(W / 2 - 100, H / 2 + 30, 2, 12, 0x4488ff).setOrigin(0, 0.5);

    const setProgress = (p) => {
      barFill.setDisplaySize(Math.max(2, Math.round(200 * p)), 12);
    };

    // ── Fetch PMD sprites for demo scouts ────────────────────────────────
    const dm = this.registry.get('dataManager');
    const total = DEMO_SCOUT_IDS.length;
    let loaded  = 0;

    for (const dexId of DEMO_SCOUT_IDS) {
      status.setText(`Fetching ${dexId} Walk sprite…`);
      try {
        // 1. Get frame dimensions from AnimData.xml
        const animData = await fetchAnimData(dexId, 'Walk', 0);

        if (animData && animData.frameW > 0) {
          const key = `pmd_${dexId}_walk`;
          const url = getAnimUrl(dexId, 'Walk', 0);

          // 2. Load the spritesheet
          await new Promise((resolve) => {
            this.load.spritesheet(key, url, {
              frameWidth:  animData.frameW,
              frameHeight: animData.frameH,
            });
            this.load.once('complete',    resolve);
            this.load.once('loaderror',   resolve); // non-fatal
            this.load.start();
          });

          // 3. Create walk animation (south row = row 0)
          const animKey = `walk_${dexId}`;
          if (!this.anims.exists(animKey) && animData.frameCount > 0) {
            const frames = [];
            for (let f = 0; f < animData.frameCount; f++) {
              frames.push({ key, frame: f }); // row 0 = south
            }
            this.anims.create({
              key: animKey, frames, frameRate: 8, repeat: -1,
            });
          }

          dm.cacheSprite(dexId, url);
          console.log(`[Preload] Loaded PMD sprite for #${dexId}`);
        } else {
          throw new Error('No animData');
        }
      } catch (err) {
        console.warn(`[Preload] Failed to load PMD sprite #${dexId}:`, err.message);
        dm.markFailed(dexId);
        // Generate a coloured fallback circle texture
        this._makeFallback(dexId);
      }

      loaded++;
      setProgress(loaded / total);
    }

    // ── Also generate fallback textures for all types ─────────────────────
    this._makeTypeFallbacks();

    // ── Player placeholder (coloured square) ─────────────────────────────
    if (!this.textures.exists('player')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff);
      g.fillRect(0, 0, 24, 24);
      g.fillStyle(0x88aaff);
      g.fillRect(4, 4, 16, 16);
      g.generateTexture('player', 24, 24);
      g.destroy();
    }

    status.setText('Ready!');
    setProgress(1);

    // Short pause so progress bar visibly completes
    await new Promise(r => this.time.delayedCall(300, r));

    this.scene.start('MainMenuScene');
  }

  _makeFallback(dexId) {
    const key = `fallback_${dexId}`;
    if (this.textures.exists(key)) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Pick color by first type (we don't have species data here, use grey)
    g.fillStyle(0x888888, 0.8);
    g.fillCircle(16, 16, 14);
    g.lineStyle(2, 0xffffff, 0.5);
    g.strokeCircle(16, 16, 14);
    g.generateTexture(key, 32, 32);
    g.destroy();
  }

  _makeTypeFallbacks() {
    for (const [type, color] of Object.entries(TYPE_COLORS)) {
      const key = `type_${type}`;
      if (this.textures.exists(key)) continue;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(color, 0.9);
      g.fillCircle(12, 12, 10);
      g.generateTexture(key, 24, 24);
      g.destroy();
    }
  }
}


