/**
 * DPad — four directional buttons rendered in BaseScene's UI layer.
 * Emits 'input:dpad' events via EventSystem.
 *
 * Layout (bottom-left):
 *        [↑]
 *   [←]  [ ]  [→]
 *        [↓]
 */
export class DPad {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('../../systems/effects/EventSystem.js').EventSystem} events
   * @param {{x?:number, y?:number, size?:number}} [opts]
   */
  constructor(scene, events, opts = {}) {
    this.scene  = scene;
    this.events = events;

    const size    = opts.size ?? 48;
    const baseX   = opts.x   ?? 70;
    const baseY   = opts.y   ?? scene.scale.height - 90;
    const gap     = size + 4;

    this._buttons = {};
    this._container = scene.add.container(0, 0);

    const dirs = [
      { dir: 'up',    dx: 0,    dy: -gap },
      { dir: 'down',  dx: 0,    dy:  gap },
      { dir: 'left',  dx: -gap, dy: 0    },
      { dir: 'right', dx:  gap, dy: 0    },
    ];

    for (const { dir, dx, dy } of dirs) {
      const btn = this._makeButton(scene, baseX + dx, baseY + dy, size, dir);
      this._buttons[dir] = btn;
      this._container.add(btn.bg);
      this._container.add(btn.label);
    }

    // Centre pip
    const pip = scene.add.rectangle(baseX, baseY, size * 0.4, size * 0.4, 0x333355, 0.6);
    this._container.add(pip);
  }

  _makeButton(scene, x, y, size, dir) {
    const ARROW = { up: '▲', down: '▼', left: '◀', right: '▶' };

    const bg = scene.add.rectangle(x, y, size, size, 0x222244, 0.75)
      .setStrokeStyle(1, 0x4444aa)
      .setInteractive({ useHandCursor: false });

    const label = scene.add.text(x, y, ARROW[dir], {
      fontSize: '18px', color: '#aaaaff',
    }).setOrigin(0.5);

    const emit = () => this.events.emit('input:dpad', { direction: dir });

    // Held-direction support — emit immediately on press, then every 150ms while held
    let held = null;
    bg.on('pointerdown', () => {
      emit();
      held = scene.time.addEvent({ delay: 150, callback: emit, loop: true });
    });
    bg.on('pointerup',   () => { if (held) { held.remove(); held = null; } });
    bg.on('pointerout',  () => { if (held) { held.remove(); held = null; } });

    // Visual press feedback
    bg.on('pointerdown', () => bg.setFillStyle(0x4444aa, 0.9));
    bg.on('pointerup',   () => bg.setFillStyle(0x222244, 0.75));
    bg.on('pointerout',  () => bg.setFillStyle(0x222244, 0.75));

    return { bg, label };
  }

  setVisible(v) { this._container.setVisible(v); }
  destroy()     { this._container.destroy(); }
}

