export class AIComponent {
  constructor({ behavior = 'aggressive' } = {}) {
    this.behavior    = behavior; // 'aggressive'|'cautious'|'support'|'patrol'|'idle'
    this.target      = null;    // entity id of current target
    this.patrolPath  = [];
    this.patrolIndex = 0;
  }
}
