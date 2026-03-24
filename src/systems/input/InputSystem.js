/**
 * InputSystem — collects raw input events forwarded by scenes into a queue.
 * ActionSystem drains the queue each frame and converts to game actions.
 *
 * Scenes forward input via EventSystem events (never call InputSystem directly).
 */
export class InputSystem {
  constructor(game) {
    this.game   = game;
    this.active = true;
    /** @type {Array<{type: string, [key: string]: any}>} */
    this._queue = [];

    const ev = this.game.events;
    ev.on('input:tile_tapped',  (d) => this._queue.push({ type: 'TILE_TAP',      ...d }));
    ev.on('input:dpad',         (d) => this._queue.push({ type: 'DPAD_MOVE',     ...d }));
    ev.on('input:move_button',  (d) => this._queue.push({ type: 'USE_MOVE',      ...d }));
    ev.on('input:panel_button', (d) => this._queue.push({ type: 'PANEL_ACTION',  ...d }));
    ev.on('input:sleep_button', ()  => this._queue.push({ type: 'SLEEP' }));
    ev.on('input:retreat',      ()  => this._queue.push({ type: 'RETREAT' }));
  }

  update(_delta) { /* passive — ActionSystem calls drain() */ }

  /** Drain and return the current queue. */
  drain() {
    const q = this._queue.slice();
    this._queue = [];
    return q;
  }
}

