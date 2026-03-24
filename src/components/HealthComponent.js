export class HealthComponent {
  constructor({ max = 100, current = null } = {}) {
    this.max     = max;
    this.current = current ?? max;
  }
  get isDead() { return this.current <= 0; }
  get pct()    { return this.max === 0 ? 0 : this.current / this.max; }
  heal(amount) { this.current = Math.min(this.max, this.current + amount); }
  damage(amount) { this.current = Math.max(0, this.current - amount); }
}
