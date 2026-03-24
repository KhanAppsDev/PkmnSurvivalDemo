/**
 * POKEMON_DATA — static species definitions.
 * Pure config — no functions, no class instances, no side effects.
 *
 * Fields:
 *   id           National dex number (used for PMD sprite CDN path)
 *   name         Display name
 *   types        Array of 1-2 type strings
 *   biome        Spawn zone: 'forest_floor'|'canopy'|'cave'|'riverbank'|'mountain'
 *   roleAffinity Primary role: 'scout'|'guard'|'worker'|'forager'|'medic'
 *   rarity       'common'|'uncommon'|'rare'|'very_rare'
 *   baseStats    { hp, atk, def, spd } — approximate PMD-style values
 *   moves        Array of { verb, payload, context[], power, type, maxPP }
 *   buildingUnlocks  Array of structure ids this type unlocks
 */

export const POKEMON_DATA = [

  // ── FOREST FLOOR ──────────────────────────────────────────────────────────

  {
    id: 399, name: 'Bidoof', types: ['normal'], biome: 'forest_floor',
    roleAffinity: 'worker', rarity: 'common',
    baseStats: { hp: 59, atk: 45, def: 40, spd: 31 },
    moves: [
      { verb: 'Cut',  payload: 'Tree', context: ['day'],    power: 0,  type: 'normal', maxPP: 0 },
      { verb: 'Chop', payload: 'Log',  context: ['day'],    power: 0,  type: 'normal', maxPP: 0 },
      { verb: 'Haul', payload: 'Land', context: ['day'],    power: 0,  type: 'normal', maxPP: 0 },
      { verb: 'Bite', payload: 'Foe',  context: ['combat'], power: 35, type: 'dark',   maxPP: 15 },
    ],
    buildingUnlocks: [],
  },

  {
    id: 400, name: 'Bibarel', types: ['normal', 'water'], biome: 'forest_floor',
    roleAffinity: 'worker', rarity: 'uncommon',
    baseStats: { hp: 79, atk: 65, def: 60, spd: 71 },
    moves: [
      { verb: 'Cut',  payload: 'Tree',        context: ['day'],    power: 0,  type: 'normal', maxPP: 0 },
      { verb: 'Chop', payload: 'Log',         context: ['day'],    power: 0,  type: 'normal', maxPP: 0 },
      { verb: 'Haul', payload: 'Land/Water',  context: ['day'],    power: 0,  type: 'normal', maxPP: 0 },
      { verb: 'Bite', payload: 'Foe',         context: ['combat'], power: 35, type: 'dark',   maxPP: 15 },
    ],
    buildingUnlocks: ['rain_collector'],
  },

  {
    id: 285, name: 'Shroomish', types: ['grass'], biome: 'forest_floor',
    roleAffinity: 'forager', rarity: 'common',
    baseStats: { hp: 60, atk: 40, def: 60, spd: 35 },
    moves: [
      { verb: 'Shoot', payload: 'Spores', context: ['combat'], power: 0,  type: 'grass',  maxPP: 15 },
      { verb: 'Bite',  payload: 'Foe',    context: ['combat'], power: 30, type: 'normal', maxPP: 20 },
    ],
    buildingUnlocks: ['spore_tower'],
  },

  {
    id: 548, name: 'Petilil', types: ['grass'], biome: 'forest_floor',
    roleAffinity: 'forager', rarity: 'common',
    baseStats: { hp: 45, atk: 35, def: 50, spd: 30 },
    moves: [
      { verb: 'Gather',    payload: 'Leaves', context: ['day'],    power: 0,  type: 'grass', maxPP: 0 },
      { verb: 'Fertilize', payload: 'Plant',  context: ['day'],    power: 0,  type: 'grass', maxPP: 0 },
    ],
    buildingUnlocks: ['garden_plot'],
  },

  {
    id: 403, name: 'Shinx', types: ['electric'], biome: 'forest_floor',
    roleAffinity: 'forager', rarity: 'common',
    baseStats: { hp: 45, atk: 65, def: 34, spd: 45 },
    moves: [
      { verb: 'Shoot', payload: 'Spark', context: ['combat'], power: 40, type: 'electric', maxPP: 12 },
      { verb: 'Bite',  payload: 'Foe',   context: ['combat'], power: 30, type: 'dark',     maxPP: 15 },
    ],
    buildingUnlocks: ['lightning_rod'],
  },

  {
    id: 404, name: 'Luxio', types: ['electric'], biome: 'forest_floor',
    roleAffinity: 'guard', rarity: 'uncommon',
    baseStats: { hp: 60, atk: 85, def: 49, spd: 60 },
    moves: [
      { verb: 'Shoot',  payload: 'Spark', context: ['combat'], power: 40, type: 'electric', maxPP: 12 },
      { verb: 'Bite',   payload: 'Foe',   context: ['combat'], power: 30, type: 'dark',     maxPP: 15 },
      { verb: 'Patrol', payload: 'Land',  context: ['day'],    power: 0,  type: 'normal',   maxPP: 0  },
    ],
    buildingUnlocks: ['lightning_rod'],
  },

  {
    id: 405, name: 'Luxray', types: ['electric'], biome: 'forest_floor',
    roleAffinity: 'guard', rarity: 'rare',
    baseStats: { hp: 80, atk: 120, def: 79, spd: 70 },
    moves: [
      { verb: 'Shoot',  payload: 'Spark', context: ['combat'],     power: 40, type: 'electric', maxPP: 12 },
      { verb: 'Bite',   payload: 'Foe',   context: ['combat'],     power: 30, type: 'dark',     maxPP: 15 },
      { verb: 'Patrol', payload: 'Land',  context: ['day'],        power: 0,  type: 'normal',   maxPP: 0  },
      { verb: 'Scan',   payload: 'Any',   context: ['day','combat'],power: 0, type: 'normal',   maxPP: 0  },
    ],
    buildingUnlocks: ['lightning_rod', 'battery'],
  },

  {
    id: 572, name: 'Minccino', types: ['normal'], biome: 'forest_floor',
    roleAffinity: 'worker', rarity: 'common',
    baseStats: { hp: 55, atk: 50, def: 40, spd: 75 },
    moves: [
      { verb: 'Retrieve', payload: 'Small', context: ['day'],    power: 0,  type: 'normal', maxPP: 0 },
      { verb: 'Scout',    payload: 'Short', context: ['day'],    power: 0,  type: 'normal', maxPP: 0 },
      { verb: 'Scratch',  payload: 'Foe',   context: ['combat'], power: 25, type: 'normal', maxPP: 20 },
    ],
    buildingUnlocks: [],
  },

  {
    id: 509, name: 'Purrloin', types: ['dark'], biome: 'forest_floor',
    roleAffinity: 'scout', rarity: 'common',
    baseStats: { hp: 41, atk: 50, def: 37, spd: 66 },
    moves: [
      { verb: 'Gather', payload: 'Loot', context: ['day'],    power: 0,  type: 'dark', maxPP: 0  },
      { verb: 'Scratch',payload: 'Foe',  context: ['combat'], power: 25, type: 'dark', maxPP: 20 },
    ],
    buildingUnlocks: ['graffiti_can'],
  },

  {
    id: 753, name: 'Fomantis', types: ['grass'], biome: 'forest_floor',
    roleAffinity: 'forager', rarity: 'common',
    baseStats: { hp: 40, atk: 55, def: 35, spd: 35 },
    moves: [
      { verb: 'Gather',    payload: 'Leaves', context: ['day'], power: 0, type: 'grass', maxPP: 0 },
      { verb: 'Fertilize', payload: 'Plant',  context: ['day'], power: 0, type: 'grass', maxPP: 0 },
    ],
    buildingUnlocks: ['garden_plot'],
  },

  // ── RIVERBANK ────────────────────────────────────────────────────────────

  {
    id: 158, name: 'Totodile', types: ['water'], biome: 'riverbank',
    roleAffinity: 'scout', rarity: 'uncommon',
    baseStats: { hp: 50, atk: 65, def: 64, spd: 43 },
    moves: [
      { verb: 'Bite',  payload: 'Foe',   context: ['combat'], power: 35, type: 'dark',  maxPP: 15 },
      { verb: 'Shoot', payload: 'Water', context: ['combat'], power: 40, type: 'water', maxPP: 15 },
    ],
    buildingUnlocks: ['rain_collector'],
  },

  {
    id: 159, name: 'Croconaw', types: ['water'], biome: 'riverbank',
    roleAffinity: 'scout', rarity: 'uncommon',
    baseStats: { hp: 65, atk: 80, def: 80, spd: 58 },
    moves: [
      { verb: 'Bite',  payload: 'Foe',   context: ['combat'], power: 35, type: 'dark',  maxPP: 15 },
      { verb: 'Shoot', payload: 'Water', context: ['combat'], power: 40, type: 'water', maxPP: 15 },
      { verb: 'Haul',  payload: 'Water', context: ['day'],    power: 0,  type: 'normal',maxPP: 0  },
    ],
    buildingUnlocks: ['rain_collector'],
  },

  {
    id: 160, name: 'Feraligatr', types: ['water'], biome: 'riverbank',
    roleAffinity: 'scout', rarity: 'rare',
    baseStats: { hp: 85, atk: 105, def: 100, spd: 78 },
    moves: [
      { verb: 'Bite',  payload: 'Foe',   context: ['combat'], power: 35, type: 'dark',  maxPP: 15 },
      { verb: 'Shoot', payload: 'Water', context: ['combat'], power: 65, type: 'water', maxPP: 12 },
      { verb: 'Haul',  payload: 'Water', context: ['day'],    power: 0,  type: 'normal',maxPP: 0  },
      { verb: 'Scare', payload: 'Foe',   context: ['combat'], power: 0,  type: 'normal',maxPP: 10 },
    ],
    buildingUnlocks: ['rain_collector'],
  },

  {
    id: 194, name: 'Wooper', types: ['water', 'ground'], biome: 'riverbank',
    roleAffinity: 'forager', rarity: 'common',
    baseStats: { hp: 55, atk: 45, def: 45, spd: 15 },
    moves: [
      { verb: 'Gather', payload: 'Mud',      context: ['day'],    power: 0,  type: 'ground', maxPP: 0  },
      { verb: 'Craft',  payload: 'MudBrick', context: ['day'],    power: 0,  type: 'ground', maxPP: 0  },
      { verb: 'Absorb', payload: 'Poison',   context: ['combat'], power: 0,  type: 'poison', maxPP: 10 },
      { verb: 'Trap',   payload: 'Goo',      context: ['combat'], power: 0,  type: 'water',  maxPP: 10 },
    ],
    buildingUnlocks: ['rain_collector', 'tunnel'],
  },

  {
    id: 550, name: 'Basculin', types: ['water'], biome: 'riverbank',
    roleAffinity: 'scout', rarity: 'common',
    baseStats: { hp: 70, atk: 92, def: 65, spd: 98 },
    moves: [
      { verb: 'Bite',  payload: 'Foe',   context: ['combat'], power: 35, type: 'dark',  maxPP: 15 },
      { verb: 'Shoot', payload: 'Water', context: ['combat'], power: 40, type: 'water', maxPP: 15 },
    ],
    buildingUnlocks: ['rain_collector'],
  },

  {
    id: 318, name: 'Carvanha', types: ['water', 'dark'], biome: 'riverbank',
    roleAffinity: 'scout', rarity: 'uncommon',
    baseStats: { hp: 45, atk: 90, def: 20, spd: 65 },
    moves: [
      { verb: 'Bite',  payload: 'Foe',   context: ['combat'], power: 40, type: 'dark',  maxPP: 15 },
      { verb: 'Shoot', payload: 'Water', context: ['combat'], power: 40, type: 'water', maxPP: 15 },
    ],
    buildingUnlocks: ['rain_collector'],
  },

  // ── CANOPY ────────────────────────────────────────────────────────────────

  {
    id: 187, name: 'Hoppip', types: ['grass', 'flying'], biome: 'canopy',
    roleAffinity: 'forager', rarity: 'common',
    baseStats: { hp: 35, atk: 35, def: 40, spd: 50 },
    moves: [
      { verb: 'Scout',     payload: 'Short', context: ['day'], power: 0, type: 'normal', maxPP: 0 },
      { verb: 'Gather',    payload: 'Seed',  context: ['day'], power: 0, type: 'grass',  maxPP: 0 },
      { verb: 'Fertilize', payload: 'Plant', context: ['day'], power: 0, type: 'grass',  maxPP: 0 },
    ],
    buildingUnlocks: ['garden_plot', 'patrol_perch'],
  },

  {
    id: 585, name: 'Deerling', types: ['normal', 'grass'], biome: 'canopy',
    roleAffinity: 'forager', rarity: 'common',
    baseStats: { hp: 60, atk: 60, def: 50, spd: 75 },
    moves: [
      { verb: 'Gather', payload: 'Leaves', context: ['day'],    power: 0,  type: 'grass',  maxPP: 0  },
      { verb: 'Scratch',payload: 'Foe',    context: ['combat'], power: 25, type: 'normal', maxPP: 20 },
    ],
    buildingUnlocks: ['garden_plot'],
  },

  {
    id: 412, name: 'Burmy', types: ['bug'], biome: 'canopy',
    roleAffinity: 'worker', rarity: 'common',
    baseStats: { hp: 40, atk: 29, def: 45, spd: 36 },
    moves: [
      { verb: 'Shoot',  payload: 'Thread', context: ['combat'], power: 10, type: 'bug',    maxPP: 20 },
      { verb: 'Weave',  payload: 'Basic',  context: ['day'],    power: 0,  type: 'bug',    maxPP: 0  },
    ],
    buildingUnlocks: ['loom'],
  },

  {
    id: 415, name: 'Combee', types: ['bug', 'flying'], biome: 'canopy',
    roleAffinity: 'forager', rarity: 'common',
    baseStats: { hp: 30, atk: 30, def: 42, spd: 70 },
    moves: [
      { verb: 'Gather', payload: 'Honey', context: ['day'],    power: 0,  type: 'bug', maxPP: 0  },
      { verb: 'Sting',  payload: 'Foe',   context: ['combat'], power: 25, type: 'bug', maxPP: 20 },
    ],
    buildingUnlocks: ['loom'],
  },

  {
    id: 193, name: 'Yanma', types: ['bug', 'flying'], biome: 'canopy',
    roleAffinity: 'scout', rarity: 'uncommon',
    baseStats: { hp: 65, atk: 65, def: 45, spd: 95 },
    moves: [
      { verb: 'Scout',  payload: 'Medium', context: ['day'],    power: 0,  type: 'normal', maxPP: 0  },
      { verb: 'Bite',   payload: 'Foe',    context: ['combat'], power: 30, type: 'dark',   maxPP: 15 },
      { verb: 'Patrol', payload: 'Air',    context: ['day'],    power: 0,  type: 'flying', maxPP: 0  },
    ],
    buildingUnlocks: ['patrol_perch'],
  },

  // ── CAVE ─────────────────────────────────────────────────────────────────

  {
    id: 524, name: 'Roggenrola', types: ['rock'], biome: 'cave',
    roleAffinity: 'worker', rarity: 'common',
    baseStats: { hp: 55, atk: 75, def: 85, spd: 15 },
    moves: [
      { verb: 'Investigate', payload: 'Rock',  context: ['day'],    power: 0,  type: 'rock',   maxPP: 0  },
      { verb: 'Throw',       payload: 'Rocks', context: ['combat'], power: 35, type: 'rock',   maxPP: 10 },
    ],
    buildingUnlocks: ['forge', 'wall_unit'],
  },

  {
    id: 551, name: 'Sandile', types: ['ground', 'dark'], biome: 'cave',
    roleAffinity: 'scout', rarity: 'common',
    baseStats: { hp: 50, atk: 72, def: 35, spd: 65 },
    moves: [
      { verb: 'Bite',   payload: 'Foe',   context: ['combat'], power: 35, type: 'dark',   maxPP: 15 },
      { verb: 'Tunnel', payload: 'Short', context: ['day'],    power: 0,  type: 'ground', maxPP: 0  },
    ],
    buildingUnlocks: ['tunnel'],
  },

  {
    id: 522, name: 'Blitzle', types: ['electric'], biome: 'cave',
    roleAffinity: 'forager', rarity: 'uncommon',
    baseStats: { hp: 45, atk: 60, def: 32, spd: 76 },
    moves: [
      { verb: 'Shoot', payload: 'Spark', context: ['combat'], power: 40, type: 'electric', maxPP: 12 },
      { verb: 'Bite',  payload: 'Foe',   context: ['combat'], power: 30, type: 'dark',     maxPP: 15 },
    ],
    buildingUnlocks: ['lightning_rod'],
  },

  // ── MOUNTAIN ─────────────────────────────────────────────────────────────

  {
    id: 597, name: 'Ferroseed', types: ['grass', 'steel'], biome: 'mountain',
    roleAffinity: 'forager', rarity: 'common',
    baseStats: { hp: 44, atk: 50, def: 91, spd: 10 },
    moves: [
      { verb: 'Shoot', payload: 'Spikes', context: ['combat'], power: 25, type: 'steel', maxPP: 15 },
    ],
    buildingUnlocks: ['garden_plot', 'storage_bin'],
  },

  {
    id: 599, name: 'Klink', types: ['steel'], biome: 'mountain',
    roleAffinity: 'worker', rarity: 'uncommon',
    baseStats: { hp: 40, atk: 55, def: 70, spd: 30 },
    moves: [
      { verb: 'Meld',  payload: 'Metal', context: ['day'],    power: 0,  type: 'steel', maxPP: 0  },
      { verb: 'Shoot', payload: 'Spark', context: ['combat'], power: 30, type: 'electric', maxPP: 12 },
    ],
    buildingUnlocks: ['tech_lab'],
  },

  {
    id: 361, name: 'Snorunt', types: ['ice'], biome: 'mountain',
    roleAffinity: 'forager', rarity: 'common',
    baseStats: { hp: 50, atk: 50, def: 50, spd: 50 },
    moves: [
      { verb: 'Shoot', payload: 'Chill', context: ['combat'], power: 35, type: 'ice', maxPP: 12 },
    ],
    buildingUnlocks: ['weather_observatory', 'sliding_trap'],
  },

  {
    id: 621, name: 'Druddigon', types: ['dragon'], biome: 'mountain',
    roleAffinity: 'guard', rarity: 'rare',
    baseStats: { hp: 77, atk: 120, def: 90, spd: 48 },
    moves: [
      { verb: 'Bite',  payload: 'Foe', context: ['combat'], power: 40, type: 'dragon', maxPP: 12 },
      { verb: 'Scare', payload: 'Foe', context: ['combat'], power: 0,  type: 'dark',   maxPP: 10 },
    ],
    buildingUnlocks: ['weather_spire', 'scale_platform'],
  },

];

/** Quick lookup by dex id. */
export const POKEMON_BY_ID = Object.fromEntries(POKEMON_DATA.map(p => [p.id, p]));

/** All ids present in the data. */
export const ROSTER_IDS = POKEMON_DATA.map(p => p.id);

// Demo scouts used in PreloadScene
export const DEMO_SCOUT_IDS = [158, 403]; // Totodile, Shinx

