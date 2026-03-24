export class MovementComponent {
  constructor({ x = 0, y = 0, speed = 1 } = {}) {
    this.x       = x;
    this.y       = y;
    this.speed   = speed;
    this.facing  = 'down'; // 'up'|'down'|'left'|'right'
    this.isMoving = false;
  }
}
