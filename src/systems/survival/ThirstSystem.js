export class ThirstSystem {
  constructor(game) {
    this.game   = game;
    this.active = true;
    this._accMs = 0;
    this._tickMs = 12000; // slightly faster than hunger
  }

  update(delta) {
    const state = this.game.state;
    if (state.dungeon.runActive) return;

    this._accMs += delta;
    if (this._accMs < this._tickMs) return;
    this._accMs -= this._tickMs;

    let decay = 1;
    if (state.warmth > 60) decay += 0.5;
    if (state.weather === 'sun') decay += 0.3;

    state.setThirst(state.thirst - Math.ceil(decay));
    if (state.thirst <= 0) state.setHp(state.hp - 2);
  }
}

