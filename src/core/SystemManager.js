/**
 * SystemManager — registers all systems and drives their update loop.
 * Systems are called in ascending priority order each frame.
 */
export class SystemManager {
  constructor() {
    /** @type {Map<string, object>} */
    this.systems = new Map();
    /** @type {Array<{name: string, priority: number}>} */
    this._order = [];
    this._paused = false;
  }

  /**
   * Register a system. Lower priority = runs first.
   * @param {string} name
   * @param {object} system  Must have an update(delta) method.
   * @param {number} priority
   */
  register(name, system, priority = 50) {
    this.systems.set(name, system);
    this._order.push({ name, priority });
    this._order.sort((a, b) => a.priority - b.priority);
    return this; // chainable
  }

  /** @param {string} name */
  getSystem(name) {
    return this.systems.get(name);
  }

  /** Called by the active Scene's update() every frame. @param {number} delta ms */
  update(delta) {
    if (this._paused) return;
    for (const { name } of this._order) {
      const sys = this.systems.get(name);
      if (sys && sys.active !== false && typeof sys.update === 'function') {
        sys.update(delta);
      }
    }
  }

  /** Run init() on every registered system that has one. */
  initAll() {
    for (const { name } of this._order) {
      const sys = this.systems.get(name);
      if (sys && typeof sys.init === 'function') sys.init();
    }
  }

  pause()  { this._paused = true; }
  resume() { this._paused = false; }
}

