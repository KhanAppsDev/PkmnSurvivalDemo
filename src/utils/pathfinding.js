// ─── A* Pathfinding ───────────────────────────────────────────────────────────
// Used for dungeon enemy movement and base patrol routing.

import { manhattan } from './grid.js';

/**
 * A* pathfinding on a 2-D grid.
 *
 * @param {Array<Array<{type:string}>>} grid  2D array [y][x], cells need a `type` field.
 * @param {{x:number,y:number}} start
 * @param {{x:number,y:number}} goal
 * @param {function({type:string}):boolean} [isWalkable]  Default: type !== 'wall'.
 * @returns {Array<{x:number,y:number}>}  Path from start to goal (exclusive of start), or [].
 */
export function findPath(grid, start, goal, isWalkable = (cell) => cell?.type !== 'wall') {
  const h = grid.length;
  const w = grid[0]?.length ?? 0;

  const key   = (x, y) => `${x},${y}`;
  const inBnd = (x, y) => x >= 0 && x < w && y >= 0 && y < h;

  const open   = new Map(); // key → node
  const closed = new Set();

  const startNode = { x: start.x, y: start.y, g: 0, h: manhattan(start, goal), parent: null };
  startNode.f = startNode.g + startNode.h;
  open.set(key(start.x, start.y), startNode);

  let iterations = 0;
  const MAX_ITER = 2000;

  while (open.size > 0 && iterations++ < MAX_ITER) {
    // Pick lowest-f node
    let current = null;
    for (const node of open.values()) {
      if (!current || node.f < current.f) current = node;
    }

    if (current.x === goal.x && current.y === goal.y) {
      // Reconstruct
      const path = [];
      let n = current;
      while (n.parent) { path.unshift({ x: n.x, y: n.y }); n = n.parent; }
      return path;
    }

    open.delete(key(current.x, current.y));
    closed.add(key(current.x, current.y));

    const neighbours = [
      { x: current.x - 1, y: current.y },
      { x: current.x + 1, y: current.y },
      { x: current.x, y: current.y - 1 },
      { x: current.x, y: current.y + 1 },
    ];

    for (const nb of neighbours) {
      if (!inBnd(nb.x, nb.y)) continue;
      if (closed.has(key(nb.x, nb.y))) continue;
      const cell = grid[nb.y][nb.x];
      if (!isWalkable(cell)) continue;

      const g = current.g + 1;
      const h = manhattan(nb, goal);
      const f = g + h;

      const existing = open.get(key(nb.x, nb.y));
      if (!existing || g < existing.g) {
        open.set(key(nb.x, nb.y), { x: nb.x, y: nb.y, g, h, f, parent: current });
      }
    }
  }

  return []; // unreachable
}


