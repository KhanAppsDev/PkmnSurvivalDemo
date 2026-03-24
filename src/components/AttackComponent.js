export class AttackComponent {
  /**
   * @param {object} opts
   * @param {number} opts.atk       Base attack stat
   * @param {Array}  opts.moves     Array of move objects from pokemon data
   */
  constructor({ atk = 10, moves = [] } = {}) {
    this.atk = atk;
    this.moves = moves.map(m => ({
      verb:    m.verb,
      payload: m.payload,
      context: m.context || ['combat'],
      power:   m.power   || 40,
      type:    m.type    || 'normal',
      pp:      m.maxPP   || 12,
      maxPP:   m.maxPP   || 12,
    }));
    // Cooldown: 0 = ready, >0 = charging (ticks down each turn)
    this.cooldown    = 0;
    this.cooldownMax = 3; // turns to recharge after attacking
  }

  get isReady() { return this.cooldown <= 0; }

  usedMove() {
    this.cooldown = this.cooldownMax;
  }

  tick() {
    if (this.cooldown > 0) this.cooldown--;
  }

  /** 0–1 fraction for the cooldown bar (1 = fully charged / ready) */
  get cooldownPct() {
    return this.cooldownMax === 0 ? 1 : 1 - this.cooldown / this.cooldownMax;
  }
}

