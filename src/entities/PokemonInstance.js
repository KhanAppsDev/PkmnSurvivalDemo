import { Entity }                from './Entity.js';
import { HealthComponent }       from '../components/HealthComponent.js';
import { AttackComponent }       from '../components/AttackComponent.js';
import { MovementComponent }     from '../components/MovementComponent.js';
import { AIComponent }           from '../components/AIComponent.js';
import { StatusEffectComponent } from '../components/StatusEffectComponent.js';

export class PokemonInstance extends Entity {
  /**
   * @param {number} id         EntityManager id
   * @param {object} speciesData  Entry from POKEMON_DATA
   */
  constructor(id, speciesData) {
    super(id);
    this.tags.add('pokemon');

    // ── Species data ──────────────────────────────────────────────────
    this.speciesId    = speciesData.id;
    this.name         = speciesData.name;
    this.types        = speciesData.types;
    this.roleAffinity = speciesData.roleAffinity;
    this.biome        = speciesData.biome;
    this.rarity       = speciesData.rarity || 'common';

    // Texture key used by renderers
    // Filled in by SpriteLoader after sprite is fetched.
    this.textureKey   = null;
    this.animKey      = null;

    // ── Instance state ─────────────────────────────────────────────────
    this.nickname        = null;
    this.friendship      = 0;       // 0–100
    this.friendshipLevel = 1;       // 1–5, derived
    this.isInjured       = false;
    this.injuryDaysLeft  = 0;
    this.currentRole     = null;    // assigned at Dusk

    // ── Components ────────────────────────────────────────────────────
    const hp  = (speciesData.baseStats?.hp  || 45) * 2;
    const atk = speciesData.baseStats?.atk || 50;
    const spd = speciesData.baseStats?.spd || 50;

    this.add(new HealthComponent({ max: hp, current: hp }));
    this.add(new AttackComponent({ atk, moves: speciesData.moves || [] }));
    this.add(new MovementComponent({ x: 0, y: 0, speed: Math.floor(spd / 20) || 1 }));
    this.add(new AIComponent({ behavior: 'cautious' }));
    this.add(new StatusEffectComponent());
  }

  get displayName() { return this.nickname || this.name; }

  updateFriendshipLevel() {
    if      (this.friendship >= 80) this.friendshipLevel = 5;
    else if (this.friendship >= 60) this.friendshipLevel = 4;
    else if (this.friendship >= 40) this.friendshipLevel = 3;
    else if (this.friendship >= 20) this.friendshipLevel = 2;
    else                            this.friendshipLevel = 1;
  }

  /** Simple serialisable snapshot for GameState.rosterIds persistence. */
  toSaveData() {
    const hp  = this.get(HealthComponent);
    const atk = this.get(AttackComponent);
    return {
      speciesId:       this.speciesId,
      nickname:        this.nickname,
      friendship:      this.friendship,
      friendshipLevel: this.friendshipLevel,
      isInjured:       this.isInjured,
      injuryDaysLeft:  this.injuryDaysLeft,
      currentRole:     this.currentRole,
      hp:              hp?.current,
      maxHp:           hp?.max,
      ppRemaining:     atk?.moves.map(m => m.pp),
    };
  }
}

