import { DIR_DELTA } from '../../utils/grid.js';

/**
 * ActionSystem — drains InputSystem queue each frame, validates actions
 * against current game phase, and emits the appropriate action:* events.
 */
export class ActionSystem {
  constructor(game) {
    this.game   = game;
    this.active = true;
  }

  update(_delta) {
    const input = this.game.systems.getSystem('InputSystem');
    if (!input) return;
    const actions = input.drain();

    for (const action of actions) {
      const phase = this.game.state.segment;
      const inDungeon = this.game.state.dungeon.runActive;

      if (inDungeon) {
        this._handleNightAction(action);
      } else {
        this._handleDayAction(action, phase);
      }
    }
  }

  _handleDayAction(action, phase) {
    const ev    = this.game.events;
    const state = this.game.state;

    switch (action.type) {
      case 'TILE_TAP': {
        const { tile } = action;
        const playerTile = { x: state.playerX, y: state.playerY };
        const dx = tile.x - playerTile.x;
        const dy = tile.y - playerTile.y;
        const dist = Math.abs(dx) + Math.abs(dy);

        if (dist === 1) {
          // Adjacent — move
          ev.emit('action:move_player', { tile });
        } else if (dist === 0) {
          // Tapped own tile — interact with structure or resource here
          ev.emit('action:interact_tile', { tile });
        }
        // Distant tap — ignore for now (could pathfind later)
        break;
      }

      case 'SLEEP':
        if (phase === 'dusk' || state.energy <= 0) {
          ev.emit('action:go_to_sleep', {});
        }
        break;

      case 'PANEL_ACTION':
        ev.emit('ui:open_panel', { panel: action.buttonId });
        break;

      default:
        break;
    }
  }

  _handleNightAction(action) {
    const ev = this.game.events;

    switch (action.type) {
      case 'DPAD_MOVE': {
        const delta = DIR_DELTA[action.direction];
        if (delta) {
          ev.emit('action:scout_move', { scoutId: 1, ...delta });
        }
        break;
      }

      case 'USE_MOVE':
        ev.emit('action:scout_use_move', { scoutId: 1, moveIndex: action.moveIndex });
        break;

      case 'RETREAT':
        ev.emit('action:scout_retreat', {});
        break;

      case 'PANEL_ACTION':
        ev.emit('ui:open_panel', { panel: action.buttonId });
        break;

      default:
        break;
    }
  }
}

