export class TemperatureSystem {
  constructor(game) {
    this.game   = game;
    this.active = true;
    this._accMs = 0;
    this._tickMs = 10000;
  }

  update(delta) {
    const state = this.game.state;
    if (state.dungeon.runActive) return;

    this._accMs += delta;
    if (this._accMs < this._tickMs) return;
    this._accMs -= this._tickMs;

    const w = state.weather;
    let delta_warmth = 0;

    if (w === 'sun')   delta_warmth = +3;
    if (w === 'rain')  delta_warmth =  0;
    if (w === 'wind')  delta_warmth = -2;
    if (w === 'snow')  delta_warmth = -3;
    if (w === 'hail')  delta_warmth = -4;
    if (w === 'storm') delta_warmth = -1;

    // Clothing modifiers
    if (state.clothing === 'winter') delta_warmth = delta_warmth > 0
      ? delta_warmth * 0.5 : delta_warmth * 0.5; // dampens both directions, keeps warmer
    if (state.clothing === 'summer' && delta_warmth > 0) delta_warmth *= 2;

    state.setWarmth(state.warmth + delta_warmth);

    // HP damage from extreme warmth
    if (state.warmth > 80) state.setHp(state.hp - 1);
    if (state.warmth <= 0) state.setHp(state.hp - 2);
  }
}
