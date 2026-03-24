/**
 * EventSystem — central pub/sub bus.
 * All inter-system and scene communication goes through here.
 * Stored on the Phaser registry so every scene and system can access it.
 *
 * Usage:
 *   const events = game.registry.get('events');
 *   events.on('combat:hit', handler);
 *   events.emit('combat:hit', { damage: 10 });
 *   events.off('combat:hit', handler);
 */
export class EventSystem {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} callback
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
  }

  /**
   * Unsubscribe a specific callback.
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    this._listeners.get(event)?.delete(callback);
  }

  /**
   * Emit an event with optional data.
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    if (this._listeners.has(event)) {
      for (const cb of this._listeners.get(event)) {
        cb(data);
      }
    }
  }

  /**
   * Remove ALL listeners registered by a specific function reference.
   * Call this in scene destroy() to prevent ghost listeners.
   * @param {Function} callback
   */
  offAll(callback) {
    for (const listeners of this._listeners.values()) {
      listeners.delete(callback);
    }
  }

  /**
   * Remove every listener for a given event (nuclear option).
   * @param {string} event
   */
  clear(event) {
    this._listeners.delete(event);
  }
}

