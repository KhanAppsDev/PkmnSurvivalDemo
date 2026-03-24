import { Entity }                from './Entity.js';
import { HealthComponent }       from '../components/HealthComponent.js';
import { AttackComponent }       from '../components/AttackComponent.js';
import { MovementComponent }     from '../components/MovementComponent.js';
import { AIComponent }           from '../components/AIComponent.js';
import { StatusEffectComponent } from '../components/StatusEffectComponent.js';

export class Enemy extends Entity {
  /**
   * @param {number} id
   * @param {object} speciesData  Subset of POKEMON_DATA entry
   * @param {{x:number,y:number}} pos  Starting position on dungeon grid
   * @param {string} [behavior]
   */
  constructor(id, speciesData, pos, behavior = 'aggressive') {
    super(id);
    this.tags.add('enemy');

    this.speciesId  = speciesData.id;
    this.name       = speciesData.name;
    this.types      = speciesData.types;
    this.textureKey = null; // filled by renderer if sprite available

    const hp  = speciesData.baseStats?.hp  || 30;
    const atk = speciesData.baseStats?.atk || 40;
    const spd = speciesData.baseStats?.spd || 40;

    this.add(new HealthComponent({ max: hp, current: hp }));
    this.add(new AttackComponent({ atk, moves: speciesData.moves || [] }));
    this.add(new MovementComponent({ x: pos.x, y: pos.y, speed: 1 }));
    this.add(new AIComponent({ behavior }));
    this.add(new StatusEffectComponent());
  }
}

