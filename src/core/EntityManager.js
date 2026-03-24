/**
 * EntityManager — creates, tracks, and queries all live Entity instances.
 */
export class EntityManager {
  constructor() {
    /** @type {Map<number, import('../entities/Entity.js').Entity>} */
    this.entities = new Map();
    this._nextId = 1;
  }

  /**
   * Create a new entity and register it.
   * @param {Function} EntityClass
   * @param {...any} args  Passed to EntityClass constructor after the id.
   */
  create(EntityClass, ...args) {
    const id = this._nextId++;
    const entity = new EntityClass(id, ...args);
    this.entities.set(id, entity);
    return entity;
  }

  destroy(id) {
    this.entities.delete(id);
  }

  /** @param {number} id */
  get(id) {
    return this.entities.get(id);
  }

  /**
   * Return all entities that have a given Component class.
   * @param {Function} ComponentClass
   */
  query(ComponentClass) {
    return [...this.entities.values()].filter(e => e.has(ComponentClass));
  }

  /**
   * Return all entities with a given tag string.
   * @param {string} tag
   */
  queryTag(tag) {
    return [...this.entities.values()].filter(e => e.tags.has(tag));
  }

  /** Remove all entities. Used on scene reset. */
  clear() {
    this.entities.clear();
    this._nextId = 1;
  }
}

