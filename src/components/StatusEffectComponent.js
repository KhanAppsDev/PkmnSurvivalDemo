export class StatusEffectComponent {
  constructor() {
    /** @type {Array<{id:string, duration:number, magnitude:number, source:string}>} */
    this.effects = [];
  }

  has(effectId) { return this.effects.some(e => e.id === effectId); }

  add(effect) {
    // Don't stack same effect — refresh duration instead
    const existing = this.effects.find(e => e.id === effect.id);
    if (existing) {
      existing.duration = Math.max(existing.duration, effect.duration);
    } else {
      this.effects.push({ magnitude: 1, source: 'unknown', ...effect });
    }
  }

  remove(effectId) {
    this.effects = this.effects.filter(e => e.id !== effectId);
  }

  /** Tick all durations, remove expired. Returns array of expired effect ids. */
  tick() {
    const expired = [];
    this.effects = this.effects.filter(e => {
      e.duration--;
      if (e.duration <= 0) { expired.push(e.id); return false; }
      return true;
    });
    return expired;
  }
}
