/**
 * Entity — base class. Holds an id, a tag set, and a component map.
 * No game logic lives here — systems operate on entities.
 */
export class Entity {
  /** @param {number} id  Assigned by EntityManager. */
  constructor(id) {
    this.id   = id;
    this.tags = new Set();
    /** @type {Map<string, object>} */
    this._components = new Map();
  }

  add(component) {
    this._components.set(component.constructor.name, component);
    return this; // chainable
  }

  /** @param {Function} ComponentClass */
  get(ComponentClass) {
    return this._components.get(ComponentClass.name);
  }

  /** @param {Function} ComponentClass */
  has(ComponentClass) {
    return this._components.has(ComponentClass.name);
  }

  /** @param {Function} ComponentClass */
  remove(ComponentClass) {
    this._components.delete(ComponentClass.name);
  }
}

