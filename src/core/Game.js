/**
 * Game — central wrapper passed to every system.
 * Provides clean accessors so systems don't import Phaser or touch the registry directly.
 *
 * Created once in MainMenuScene and stored on the registry as 'game'.
 */
export class Game {
  /** @param {Phaser.Data.DataManager} registry */
  constructor(registry) {
    this._registry = registry;
  }

  /** @returns {import('../systems/effects/EventSystem.js').EventSystem} */
  get events()   { return this._registry.get('events'); }

  /** @returns {import('../systems/state/GameState.js').GameState} */
  get state()    { return this._registry.get('gameState'); }

  /** @returns {import('./SystemManager.js').SystemManager} */
  get systems()  { return this._registry.get('systemManager'); }

  /** @returns {import('./EntityManager.js').EntityManager} */
  get entities() { return this._registry.get('entityManager'); }

  /** @returns {import('../systems/persistence/DataManager.js').DataManager} */
  get data()     { return this._registry.get('dataManager'); }
}

