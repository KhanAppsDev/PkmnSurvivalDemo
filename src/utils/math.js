// ─── Math helpers ─────────────────────────────────────────────────────────────

export const clamp  = (v, min, max) => Math.max(min, Math.min(max, v));
export const lerp   = (a, b, t) => a + (b - a) * t;
export const pct    = (v, max) => (max === 0 ? 0 : v / max);
export const round2 = (v) => Math.round(v * 100) / 100;

// ── Type effectiveness ────────────────────────────────────────────────────────
// Returns 0 | 0.25 | 0.5 | 1 | 2 | 4
const CHART = {
  fire:     { grass: 2, ice: 2, bug: 2, steel: 2, fire: 0.5, water: 0.5, rock: 0.5, dragon: 0.5 },
  water:    { fire: 2, ground: 2, rock: 2, water: 0.5, grass: 0.5, dragon: 0.5 },
  grass:    { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, flying: 2, electric: 0.5, grass: 0.5, dragon: 0.5, ground: 0 },
  ice:      { grass: 2, ground: 2, flying: 2, dragon: 2, fire: 0.5, water: 0.5, ice: 0.5, steel: 0.5 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, bug: 0.5, psychic: 0.5, flying: 0.5, fairy: 0.5, ghost: 0 },
  poison:   { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
  ground:   { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
  flying:   { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0, ghost: 0 },  // Note: ghost 0 in gen1 but corrected in later gens
  bug:      { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
  ghost:    { psychic: 2, ghost: 2, normal: 0, fighting: 0 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  steel:    { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
  fairy:    { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 },
  normal:   { ghost: 0 },
};

/**
 * @param {string} moveType
 * @param {string[]} defenderTypes  Array of 1-2 type strings.
 * @returns {number} Damage multiplier.
 */
export function getTypeEffectiveness(moveType, defenderTypes) {
  const row = CHART[moveType] || {};
  return defenderTypes.reduce((mult, t) => mult * (row[t] ?? 1), 1);
}

/**
 * Damage formula.
 * @param {number} atk   Attacker's attack stat.
 * @param {number} def   Defender's defence stat (use 1 if not applicable).
 * @param {number} power Move base power.
 * @param {number} typeMultiplier  From getTypeEffectiveness().
 * @param {Function} rng  Seeded RNG for variance.
 */
export function calcDamage(atk, def, power, typeMultiplier, rng = Math.random) {
  const base = ((atk / Math.max(def, 1)) * power * typeMultiplier) / 50;
  const variance = 0.85 + rng() * 0.15;
  return Math.max(1, Math.floor(base * variance));
}

