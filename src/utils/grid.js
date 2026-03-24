// ─── Grid utilities ───────────────────────────────────────────────────────────
// Pure functions — no imports, no state.

export const TILE_SIZE   = 36;  // px per island tile (10×10 grid = 360px)
export const GRID_W      = 10;
export const GRID_H      = 10;
export const DUNGEON_TILE = 24; // px per dungeon tile

/** Screen pixel → island tile coord */
export function screenToTile(px, py, size = TILE_SIZE) {
  return { x: Math.floor(px / size), y: Math.floor(py / size) };
}

/** Island tile → screen center pixel */
export function tileToScreen(tx, ty, size = TILE_SIZE) {
  return { x: tx * size + size / 2, y: ty * size + size / 2 };
}

/** Tile index (0-99) → {x, y} */
export function indexToCoord(i) {
  return { x: i % GRID_W, y: Math.floor(i / GRID_W) };
}

/** {x,y} → tile index */
export function coordToIndex(x, y) {
  return y * GRID_W + x;
}

/** Is this coord within island bounds? */
export function inBounds(x, y, w = GRID_W, h = GRID_H) {
  return x >= 0 && x < w && y >= 0 && y < h;
}

/** 4-directional neighbours within bounds */
export function getNeighbours(x, y, w = GRID_W, h = GRID_H) {
  return [
    { x: x - 1, y }, { x: x + 1, y },
    { x, y: y - 1 }, { x, y: y + 1 },
  ].filter(t => inBounds(t.x, t.y, w, h));
}

/** Manhattan distance between two {x,y} points */
export function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/** Is b within `range` tiles of a? */
export function inRange(a, b, range) {
  return manhattan(a, b) <= range;
}

/** Direction string from delta */
export function deltaToDir(dx, dy) {
  if (dy < 0) return 'up';
  if (dy > 0) return 'down';
  if (dx < 0) return 'left';
  return 'right';
}

export const DIR_DELTA = {
  up:    { dx:  0, dy: -1 },
  down:  { dx:  0, dy:  1 },
  left:  { dx: -1, dy:  0 },
  right: { dx:  1, dy:  0 },
};
