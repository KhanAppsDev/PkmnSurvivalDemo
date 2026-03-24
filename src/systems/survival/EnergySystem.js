/**
 * EnergySystem — deducts Energy when actions are taken.
 * Listens for action events and charges the appropriate cost.
 * Also applies penalty multipliers from low Hunger/Thirst/Warmth.
 */
export class EnergySystem {
  constructor(game) {
    this.game   = game;
    this.active = true;

    const ev = game.events;
    ev.on('action:move_player',      () => this._spend(10));
    ev.on('action:gather_resource',  () => this._spend(12));
    ev.on('action:build_structure',  (d) => this._spend(d.cost || 30));
    ev.on('action:craft_item',       (d) => this._spend(d.cost || 10));
  }

  update(_delta) { /* event-driven */ }

  _spend(base) {
    const state = this.game.state;
    let mult = 1;
    if (state.hunger < 50) mult += 0.1;
    if (state.thirst < 50) mult += 0.1;
    if (state.warmth < 40 || state.warmth > 60) mult += 0.05;

    const cost = Math.round(base * mult);
    state.setEnergy(state.energy - cost);
  }
}
