/**
 * DataManager — manages localStorage sprite cache and misc persistent non-save data.
 * Kept separate from SaveSystem because sprite cache survives across saves/loads.
 */

const SPRITE_CACHE_KEY = 'islands_edge_sprites';

// TYPE_COLORS used to generate fallback placeholder textures
export const TYPE_COLORS = {
  normal:   0xA8A878, fire:     0xF08030, water:    0x6890F0,
  electric: 0xF8D030, grass:    0x78C850, ice:      0x98D8D8,
  fighting: 0xC03028, poison:   0xA040A0, ground:   0xE0C068,
  flying:   0xA890F0, psychic:  0xF85888, bug:      0xA8B820,
  rock:     0xB8A038, ghost:    0x705898, dragon:   0x7038F8,
  dark:     0x705848, steel:    0xB8B8D0, fairy:    0xEE99AC,
};

export class DataManager {
  constructor() {
    try {
      this._cache = JSON.parse(localStorage.getItem(SPRITE_CACHE_KEY) || '{}');
    } catch {
      this._cache = {};
    }
    /** @type {Set<number>} IDs that failed to load */
    this._failed = new Set();
  }

  hasCachedSprite(id) { return !!this._cache[id]; }

  cacheSprite(id, url) {
    this._cache[id] = url;
    try {
      localStorage.setItem(SPRITE_CACHE_KEY, JSON.stringify(this._cache));
    } catch { /* storage full — non-fatal */ }
  }

  markFailed(id)  { this._failed.add(id); }
  hasFailed(id)   { return this._failed.has(id); }

  /** Returns Phaser texture key to use for this species. */
  getSpriteKey(id) {
    if (this._failed.has(id)) return `fallback_${id}`;
    return `pmd_${id}_walk`;
  }

  clearSpriteCache() {
    this._cache = {};
    localStorage.removeItem(SPRITE_CACHE_KEY);
  }
}


