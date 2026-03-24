/**
 * GameState — single source of truth for all runtime state.
 * Systems read and write through the setters so events always fire.
 *
 * Stored on the Phaser registry as 'gameState'.
 */
export class GameState {
  /** @param {import('../../systems/effects/EventSystem.js').EventSystem} events */
  constructor(events) {
    this._events = events;

    // ── Player (human) ─────────────────────────────────────────────────
    // These are HUMAN-ONLY. Pokémon only track HP + Injury.
    this.energy    = 100;
    this.energyCap = 100;
    this.hunger    = 100;
    this.thirst    = 100;
    this.warmth    = 50;
    this.hp        = 100;

    // Gear
    this.clothing          = 'balanced'; // 'balanced'|'winter'|'summer'|null
    this.hasSoulPendant    = false;
    this.hasCombatGloves   = false;
    this.soulCharges       = 0;

    // Player position on island grid
    this.playerX = 5;
    this.playerY = 5;

    // Inventory: itemId → quantity
    this.inventory    = {};
    this.inventoryCap = 30;

    // Active status effects on player: [{ id, duration, magnitude }]
    this.playerStatusEffects = [];

    // Satiety timer (ms) — set by cooking system, pauses hunger decay while > 0
    this._satietyMs = 0;

    // ── World ──────────────────────────────────────────────────────────
    this.day         = 1;
    this.segment     = 'morning'; // 'morning'|'midday'|'afternoon'|'dusk'
    this.weather     = 'sun';
    this.weatherQueue = [];

    // 10×10 tile grid
    this.tiles = this._buildTiles();

    // Pokémon roster (up to 12 PokemonInstance-like plain objects when serialized)
    // At runtime these are PokemonInstance entities tracked by EntityManager.
    // GameState only holds their IDs + serializable data.
    this.rosterIds = []; // entity IDs

    // Slot assignments for tonight
    this.assignments = {
      scouts:   [null, null],
      guards:   [null, null, null, null, null, null],
      workers:  [null, null, null, null],
      foragers: [null, null, null, null],
    };

    // Dungeon progress
    this.dungeonProgress = {
      rootweb_hollow:  { deepestFloor: 0, unlocked: false },
      ember_depths:    { deepestFloor: 0, unlocked: false },
      forgotten_vault: { deepestFloor: 0, unlocked: false },
      murk_hollow:     { deepestFloor: 0, unlocked: false },
      tidal_caves:     { deepestFloor: 0, unlocked: false },
      heart_sanctum:   { deepestFloor: 0, unlocked: false },
    };

    // Victory
    this.victoryRoute    = null;
    this.victoryProgress = {};

    // RNG seed — used for dungeon generation
    this.rngSeed = Date.now();

    // ── Dungeon (night phase) ──────────────────────────────────────────
    this.dungeon = {
      activeBranch:  null,
      currentFloor:  0,
      floorSeed:     0,
      scout1EntityId: null,
      scout2EntityId: null,
      scout1Pos:     { x: 0, y: 0 },
      scout2Pos:     { x: 1, y: 0 },
      scout2Behavior: 'cautious',
      pendingLoot:   [],
      runActive:     false,
      runResult:     null,
      floor: {
        grid:        [],
        rooms:       [],
        staircase:   null,
        playerStart: null,
        enemies:     [],
        items:       [],
      },
    };
  }

  // ── Setters (always emit after change) ─────────────────────────────────

  setEnergy(v) {
    this.energy = Math.max(0, Math.min(this.energyCap, v));
    this._emitMeters();
    if (this.energy <= 0) this._events.emit('survival:energy_depleted', {});
  }

  setHunger(v) {
    const prev = this.hunger;
    this.hunger = Math.max(0, Math.min(100, v));
    this._emitMeters();
    if (prev >= 50 && this.hunger < 50) this._events.emit('survival:hunger_warning', { value: this.hunger });
    if (prev >= 25 && this.hunger < 25) this._events.emit('survival:hunger_critical', { value: this.hunger });
  }

  setThirst(v) {
    const prev = this.thirst;
    this.thirst = Math.max(0, Math.min(100, v));
    this._emitMeters();
    if (prev >= 50 && this.thirst < 50) this._events.emit('survival:thirst_warning', { value: this.thirst });
    if (prev >= 25 && this.thirst < 25) this._events.emit('survival:thirst_critical', { value: this.thirst });
  }

  setWarmth(v) {
    const prev = this.warmth;
    this.warmth = Math.max(0, Math.min(100, v));
    this._emitMeters();
    if (this.warmth < 40) this._events.emit('survival:too_cold', { warmth: this.warmth });
    else if (this.warmth > 80) this._events.emit('survival:overheating', { warmth: this.warmth });
    else if (this.warmth > 60) this._events.emit('survival:too_hot', { warmth: this.warmth });
    else if (prev < 40 || prev > 60) this._events.emit('survival:warmth_optimal', {});
  }

  setHp(v) {
    this.hp = Math.max(0, Math.min(100, v));
    this._emitMeters();
    if (this.hp <= 0) this._events.emit('player:game_over', {});
  }

  setWeather(w) {
    const from = this.weather;
    this.weather = w;
    this._events.emit('weather:changed', { from, to: w });
  }

  setDay(d) {
    this.day = d;
    this._events.emit('state:day_changed', { day: d });
  }

  setSegment(s) {
    this.segment = s;
    this._events.emit('time:segment_changed', { segment: s });
    if (s === 'dusk') this._events.emit('day:dusk', { day: this.day });
  }

  addItem(itemId, qty = 1) {
    this.inventory[itemId] = (this.inventory[itemId] || 0) + qty;
    this._events.emit('state:inventory_changed', { inventory: this.inventory, cap: this.inventoryCap });
  }

  removeItem(itemId, qty = 1) {
    this.inventory[itemId] = Math.max(0, (this.inventory[itemId] || 0) - qty);
    if (this.inventory[itemId] === 0) delete this.inventory[itemId];
    this._events.emit('state:inventory_changed', { inventory: this.inventory, cap: this.inventoryCap });
  }

  hasItem(itemId, qty = 1) {
    return (this.inventory[itemId] || 0) >= qty;
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  _emitMeters() {
    this._events.emit('state:meters_changed', {
      energy: this.energy, energyCap: this.energyCap,
      hunger: this.hunger, thirst: this.thirst,
      warmth: this.warmth, hp: this.hp,
    });
  }

  _buildTiles() {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: i % 10,
      y: Math.floor(i / 10),
      biome: 'forest_floor',
      resourceNode: null,   // { type, quantity, respawnDay } or null
      structure: null,      // { structureId, level, hp, maxHp, operatorEntityId } or null
      isRevealed: i === 55, // start tile revealed
      isLocked: false,
    }));
  }

  getTile(x, y) { return this.tiles[y * 10 + x]; }

  // ── Serialization ──────────────────────────────────────────────────────

  serialize() {
    // Deep clone via JSON round-trip (fine for plain data, _events excluded)
    const { _events, ...rest } = this;
    return JSON.parse(JSON.stringify(rest));
  }

  hydrate(data) {
    const { _events, ...rest } = this;
    Object.assign(this, data);
    this._events = _events; // re-attach transient ref
  }
}


