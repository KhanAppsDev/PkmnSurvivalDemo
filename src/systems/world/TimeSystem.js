/**
 * TimeSystem — advances time segments based on Energy thresholds.
 * Segments: morning (>70 E) → midday (>40 E) → afternoon (>10 E) → dusk (0 E).
 * Emits day:dawn at the start of each new day.
 */
export class TimeSystem {
  constructor(game) {
    this.game   = game;
    this.active = true;
    this._dawnFired = false;
  }

  init() {
    // Fire dawn immediately when the game starts
    this._fireDawn();
  }

  update(_delta) {
    const state = this.game.state;
    if (state.dungeon.runActive) return; // night phase — time frozen

    const energy  = state.energy;
    const segment = state.segment;

    let next = null;
    if (segment === 'morning'   && energy <= 70) next = 'midday';
    if (segment === 'midday'    && energy <= 40) next = 'afternoon';
    if (segment === 'afternoon' && energy <= 10) next = 'dusk';

    if (next) {
      state.setSegment(next);
      if (next === 'dusk') {
        // Don't auto-sleep — player must tap the sleep button
        // But emit so UIScene can highlight the sleep button
        this.game.events.emit('day:dusk', { day: state.day });
      }
    }
  }

  /** Call this at the start of a new day (after dungeon run resolves). */
  newDay() {
    this.game.state.setDay(this.game.state.day + 1);
    this.game.state.segment = 'morning';
    this._fireDawn();
  }

  _fireDawn() {
    this.game.events.emit('day:dawn', { day: this.game.state.day });
  }
}


