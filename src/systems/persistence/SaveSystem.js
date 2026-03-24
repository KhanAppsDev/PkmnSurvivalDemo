/**
 * SaveSystem — serializes/restores GameState to/from localStorage.
 * Auto-saves at dawn and dusk events.
 */

const SLOT_KEYS   = ['islands_edge_slot_0', 'islands_edge_slot_1', 'islands_edge_slot_2'];
const AUTOSAVE_KEY = 'islands_edge_autosave';

export class SaveSystem {
  constructor(game) {
    this.game   = game;
    this.active = true;
  }

  init() {
    this.game.events.on('day:dawn', () => this._autosave());
    this.game.events.on('day:dusk', () => this._autosave());
  }

  update(_delta) { /* event-driven only */ }

  // ── Public API ──────────────────────────────────────────────────────────

  /** Save to a numbered slot (0–2). */
  save(slot) {
    if (slot < 0 || slot > 2) return;
    const payload = {
      slot,
      timestamp: Date.now(),
      day: this.game.state.day,
      state: this.game.state.serialize(),
    };
    try {
      localStorage.setItem(SLOT_KEYS[slot], JSON.stringify(payload));
      this.game.events.emit('save:complete', { slot });
    } catch (err) {
      this.game.events.emit('save:failed', { error: err.message });
    }
  }

  /** Load from a numbered slot. Returns true on success. */
  load(slot) {
    try {
      const raw = localStorage.getItem(SLOT_KEYS[slot]);
      if (!raw) return false;
      const payload = JSON.parse(raw);
      this.game.state.hydrate(payload.state);
      this.game.events.emit('load:complete', { slot });
      return true;
    } catch {
      return false;
    }
  }

  /** Returns metadata for all 3 slots (for the main menu). */
  getSlots() {
    return SLOT_KEYS.map((key, i) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return { slot: i, empty: true };
        const { timestamp, day } = JSON.parse(raw);
        return { slot: i, empty: false, day, timestamp };
      } catch {
        return { slot: i, empty: true };
      }
    });
  }

  // ── Private ─────────────────────────────────────────────────────────────

  _autosave() {
    const payload = {
      timestamp: Date.now(),
      day: this.game.state.day,
      state: this.game.state.serialize(),
    };
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
    } catch { /* non-fatal */ }
  }
}

