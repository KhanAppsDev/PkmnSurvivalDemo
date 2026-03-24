/**
 * HUD — persistent heads-up display.
 *
 * DAY MODE   (top strip):  Day | Weather | ⚡ Energy | 🍖 Hunger | 💧 Thirst | 🌡 Warmth | ❤ HP
 * NIGHT MODE (top strip):  Scout1 name + HP bar + cooldown | Floor | Retreat | Scout2 HP + cooldown
 *
 * Listens to EventSystem for state changes. Never calls systems directly.
 */

const BAR_W  = 60;
const BAR_H  = 8;
const PAD    = 6;

export class HUD {
  /**
   * @param {Phaser.Scene} scene   UIScene
   * @param {import('../../systems/effects/EventSystem.js').EventSystem} events
   */
  constructor(scene, events) {
    this.scene  = scene;
    this.events = events;
    this._mode  = 'day'; // 'day' | 'night'

    // ── Day strip ─────────────────────────────────────────────────────────
    this._dayGroup = scene.add.container(0, 0).setDepth(100);
    this._buildDayStrip();

    // ── Night strip ───────────────────────────────────────────────────────
    this._nightGroup = scene.add.container(0, 0).setDepth(100);
    this._buildNightStrip();

    this.setMode('day');

    // Subscribe
    events.on('state:meters_changed', (m) => this._onMeters(m));
    events.on('state:day_changed',    (d) => this._onDay(d.day));
    events.on('weather:changed',      (w) => this._onWeather(w.to));
    events.on('dungeon:floor_generated', (d) => this._onFloor(d.floor));
    events.on('state:scout_moved',    ()  => this._onScoutUpdate());
    events.on('combat:hit',           ()  => this._onScoutUpdate());
    events.on('player:dungeon_start', ()  => this.setMode('night'));
    events.on('player:dungeon_end',   ()  => this.setMode('day'));
  }

  // ── Day strip ─────────────────────────────────────────────────────────────

  _buildDayStrip() {
    const s   = this.scene;
    const g   = this._dayGroup;
    const W   = s.scale.width;
    const y0  = 0;
    const h   = 44;

    // Background
    g.add(s.add.rectangle(W / 2, y0 + h / 2, W, h, 0x0a0a1a, 0.92));

    // Day counter
    this._dayText = s.add.text(8, y0 + 14, 'Day 1', {
      fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
    });
    g.add(this._dayText);

    // Weather icon
    this._weatherText = s.add.text(60, y0 + 14, '☀️', { fontSize: '14px' });
    g.add(this._weatherText);

    // Meters row
    const meterDefs = [
      { key: 'energy', icon: '⚡', color: 0xffdd00, x: 100 },
      { key: 'hunger', icon: '🍖', color: 0xff8844, x: 180 },
      { key: 'thirst', icon: '💧', color: 0x44aaff, x: 260 },
      { key: 'warmth', icon: '🌡', color: 0xff6644, x: 310 },
    ];

    this._dayBars = {};
    for (const def of meterDefs) {
      const icon = s.add.text(def.x, y0 + 8, def.icon, { fontSize: '11px' }).setOrigin(0, 0);
      const bg   = s.add.rectangle(def.x + 16, y0 + 25, BAR_W, BAR_H, 0x333333).setOrigin(0, 0.5);
      const fill = s.add.rectangle(def.x + 16, y0 + 25, BAR_W, BAR_H, def.color).setOrigin(0, 0.5);
      g.add(icon); g.add(bg); g.add(fill);
      this._dayBars[def.key] = fill;
    }

    // HP (small, right side)
    this._hpText = s.add.text(W - 50, y0 + 14, '❤ 100', {
      fontSize: '11px', color: '#ff6666',
    });
    g.add(this._hpText);
  }

  // ── Night strip ───────────────────────────────────────────────────────────

  _buildNightStrip() {
    const s  = this.scene;
    const g  = this._nightGroup;
    const W  = s.scale.width;
    const h  = 54;

    // Background
    g.add(s.add.rectangle(W / 2, h / 2, W, h, 0x0a0a1a, 0.95));

    // Scout 1 (left)
    this._s1Name = s.add.text(8, 4, 'Scout 1', { fontSize: '10px', color: '#aaffaa' });
    g.add(this._s1Name);

    const s1BgBar = s.add.rectangle(8, 20, BAR_W + 10, BAR_H, 0x333333).setOrigin(0, 0.5);
    this._s1HpBar = s.add.rectangle(8, 20, BAR_W + 10, BAR_H, 0x44ff44).setOrigin(0, 0.5);
    g.add(s1BgBar); g.add(this._s1HpBar);

    // Scout 1 cooldown bar
    const s1CdBg = s.add.rectangle(8, 34, BAR_W + 10, 5, 0x222222).setOrigin(0, 0.5);
    this._s1CdBar = s.add.rectangle(8, 34, BAR_W + 10, 5, 0xffaa00).setOrigin(0, 0.5);
    g.add(s1CdBg); g.add(this._s1CdBar);

    const s1CdLabel = s.add.text(8, 38, 'ATK CD', { fontSize: '8px', color: '#ffaa00' });
    g.add(s1CdLabel);

    // Floor + Retreat (centre)
    this._floorText = s.add.text(W / 2, 14, 'Floor 1', {
      fontSize: '12px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    g.add(this._floorText);

    // Scout 2 (right)
    const s2X = W - BAR_W - 18;
    this._s2Name = s.add.text(s2X, 4, 'Scout 2', { fontSize: '10px', color: '#aaaaff' });
    g.add(this._s2Name);

    const s2BgBar = s.add.rectangle(s2X, 20, BAR_W + 10, BAR_H, 0x333333).setOrigin(0, 0.5);
    this._s2HpBar = s.add.rectangle(s2X, 20, BAR_W + 10, BAR_H, 0x4444ff).setOrigin(0, 0.5);
    g.add(s2BgBar); g.add(this._s2HpBar);

    const s2CdBg = s.add.rectangle(s2X, 34, BAR_W + 10, 5, 0x222222).setOrigin(0, 0.5);
    this._s2CdBar = s.add.rectangle(s2X, 34, BAR_W + 10, 5, 0xffaa00).setOrigin(0, 0.5);
    g.add(s2CdBg); g.add(this._s2CdBar);

    const s2CdLabel = s.add.text(s2X, 38, 'ATK CD', { fontSize: '8px', color: '#ffaa00' });
    g.add(s2CdLabel);
  }

  // ── Public ────────────────────────────────────────────────────────────────

  setMode(mode) {
    this._mode = mode;
    this._dayGroup.setVisible(mode === 'day');
    this._nightGroup.setVisible(mode === 'night');
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  _onMeters({ energy, energyCap, hunger, thirst, warmth, hp }) {
    const pct = (v, cap = 100) => Math.max(0, Math.min(1, v / cap));

    if (this._dayBars.energy) this._dayBars.energy.setDisplaySize(Math.round(BAR_W * pct(energy, energyCap)), BAR_H);
    if (this._dayBars.hunger) this._dayBars.hunger.setDisplaySize(Math.round(BAR_W * pct(hunger)), BAR_H);
    if (this._dayBars.thirst) this._dayBars.thirst.setDisplaySize(Math.round(BAR_W * pct(thirst)), BAR_H);
    if (this._dayBars.warmth) {
      // Warmth bar: green in optimal zone (40-60), orange outside
      const p = pct(warmth);
      const col = (warmth >= 40 && warmth <= 60) ? 0x44ff88 : 0xff6644;
      this._dayBars.warmth.setFillStyle(col).setDisplaySize(Math.round(BAR_W * p), BAR_H);
    }
    if (this._hpText) this._hpText.setText(`❤ ${hp}`);
  }

  _onDay(day) {
    if (this._dayText) this._dayText.setText(`Day ${day}`);
  }

  _onWeather(w) {
    const icons = { sun: '☀️', rain: '🌧', storm: '⛈', snow: '❄️', hail: '🌨', wind: '💨' };
    if (this._weatherText) this._weatherText.setText(icons[w] || '?');
  }

  _onFloor(floor) {
    if (this._floorText) this._floorText.setText(`Floor ${floor}`);
  }

  _onScoutUpdate() {
    // Pull live data from game state via registry
    const state = this.scene.registry.get('gameState');
    if (!state) return;

    const entities = this.scene.registry.get('entityManager');
    if (!entities) return;

    const s1Id = state.dungeon.scout1EntityId;
    const s2Id = state.dungeon.scout2EntityId;

    const updateScout = (entityId, nameEl, hpBar, cdBar, maxBarW) => {
      if (!entityId) return;
      const entity = entities.get(entityId);
      if (!entity) return;

      const hp  = entity._components.get('HealthComponent');
      const atk = entity._components.get('AttackComponent');

      if (hp) {
        const w = Math.round(maxBarW * Math.max(0, hp.pct));
        hpBar.setDisplaySize(w, BAR_H);
        const col = hp.pct > 0.5 ? 0x44ff44 : hp.pct > 0.25 ? 0xffaa00 : 0xff3333;
        hpBar.setFillStyle(col);
      }
      if (atk) {
        const w = Math.round(maxBarW * atk.cooldownPct);
        cdBar.setDisplaySize(w, 5);
      }
      if (nameEl && entity.displayName) nameEl.setText(entity.displayName);
    };

    const maxW = BAR_W + 10;
    updateScout(s1Id, this._s1Name, this._s1HpBar, this._s1CdBar, maxW);
    updateScout(s2Id, this._s2Name, this._s2HpBar, this._s2CdBar, maxW);
  }

  destroy() {
    this._dayGroup.destroy();
    this._nightGroup.destroy();
  }
}


