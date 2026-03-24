/**
 * HungerSystem — passive hunger decay over real time.
 * Only active during day phase.
 */
export class HungerSystem {
  constructor(game) {
    this.game    = game;
    this.active  = true;
    this._accMs  = 0;
    // 1 hunger unit per N ms of real time
    this._tickMs = 15000; // 1 unit per 15 seconds (tune this)
  }

  update(delta) {
    const state = this.game.state;
    if (state.dungeon.runActive) return;

    this._accMs += delta;
    if (this._accMs < this._tickMs) return;
    this._accMs -= this._tickMs;

    let decay = 1;
    if (state.warmth < 40) decay += 0.5; // cold makes you hungrier
    if (state.weather === 'hail' || state.weather === 'snow') decay += 0.2;

    // Satiety effect pauses decay
    if (state._satietyMs > 0) { state._satietyMs -= this._tickMs; return; }

    state.setHunger(state.hunger - Math.ceil(decay));

    // Low hunger → HP tick
    if (state.hunger <= 0) state.setHp(state.hp - 2);
  }
}


