export const BIOMES = {
  forest_floor: {
    id: 'forest_floor', name: 'Forest Floor',
    tileColor: 0x4a7c59, borderColor: 0x2d5a3a,
    resources: ['forest_berry', 'fiber', 'wood', 'leaves'],
  },
  canopy: {
    id: 'canopy', name: 'Canopy Forest',
    tileColor: 0x2d5a27, borderColor: 0x1a3a18,
    resources: ['wood', 'sap', 'berries', 'seeds', 'fruit'],
    dungeon: 'rootweb_hollow',
  },
  cave: {
    id: 'cave', name: 'Cave',
    tileColor: 0x4a3f35, borderColor: 0x2a1f15,
    resources: ['stone', 'metal', 'coal', 'ore'],
    dungeon: 'ember_depths',
  },
  riverbank: {
    id: 'riverbank', name: 'Riverbank',
    tileColor: 0x3a6b8a, borderColor: 0x1a3b5a,
    resources: ['water', 'mud', 'fish', 'herbs'],
    dungeon: 'murk_hollow',
  },
  mountain: {
    id: 'mountain', name: 'Mountain',
    tileColor: 0x7a7a8a, borderColor: 0x5a5a6a,
    resources: ['rare_ore', 'ice', 'peat'],
    dungeon: 'ember_depths',
  },
};

// Dungeon floor tile colors
export const DUNGEON_COLORS = {
  wall:     0x1a1a2e,
  floor:    0x2d2d44,
  corridor: 0x252538,
  fog:      0x0a0a15,
  staircase:0xf0c040,
};

