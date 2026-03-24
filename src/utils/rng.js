// ─── Seeded RNG ───────────────────────────────────────────────────────────────
// Always use createRNG() for gameplay logic (dungeon gen, loot rolls).
// Use Math.random() ONLY for cosmetic effects (particles, screen shake).

/**
 * Mulberry32 seeded PRNG.
 * Returns a function that yields floats in [0, 1).
 * @param {number} seed
 */
export function createRNG(seed) {
  let s = seed >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Weighted random pick.
 * @param {Array<{weight: number}>} pool  Objects must have a `weight` property.
 * @param {Function} rng  A function returning a float in [0,1).
 * @returns The chosen entry (whole object).
 */
export function weightedRandom(pool, rng = Math.random) {
  const total = pool.reduce((s, p) => s + (p.weight || 1), 0);
  let roll = rng() * total;
  for (const entry of pool) {
    roll -= entry.weight || 1;
    if (roll <= 0) return entry;
  }
  return pool[pool.length - 1];
}

/**
 * Random integer in [min, max] inclusive.
 * @param {number} min
 * @param {number} max
 * @param {Function} rng
 */
export function randInt(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Shuffle an array in place (Fisher-Yates).
 * @param {Array} arr
 * @param {Function} rng
 */
export function shuffle(arr, rng = Math.random) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
