import type { Direction, EnemyMode, GridPoint } from '../data/types';
import { DIRECTION_VECTORS } from '../utils/grid';
import { GridManager, type EnemyTraversalState } from './GridManager';

interface MovableState {
  x: number;
  y: number;
  direction: Direction | null;
  bufferedDirection: Direction | null;
  currentTile: GridPoint;
  speed: number;
  setDirection?: (direction: Direction | null) => void;
}

export class GridMovementSystem {
  private readonly centerThreshold = 5;

  movePlayer(
    actor: MovableState,
    grid: GridManager,
    deltaSeconds: number,
    requestedDirection: Direction | null,
  ): void {
    if (requestedDirection) {
      actor.bufferedDirection = requestedDirection;
    }

    this.stepActor(actor, grid, deltaSeconds, 'player');
  }

  moveEnemy(
    actor: MovableState,
    grid: GridManager,
    deltaSeconds: number,
    mode: EnemyTraversalState,
    forcedDirection: Direction | null,
  ): void {
    actor.bufferedDirection = forcedDirection;
    this.stepActor(actor, grid, deltaSeconds, 'enemy', mode);
  }

  private stepActor(
    actor: MovableState,
    grid: GridManager,
    deltaSeconds: number,
    occupant: 'player' | 'enemy',
    mode?: EnemyTraversalState,
  ): void {
    const tile = grid.worldToTile(actor);
    const atCenter = grid.isNearTileCenter(actor, this.centerThreshold);

    if (atCenter) {
      actor.currentTile = tile;
      const canTurn =
        actor.bufferedDirection !== null &&
        actor.bufferedDirection !== actor.direction &&
        grid.canOccupyWithState(grid.getAdjacentTile(tile, actor.bufferedDirection), occupant, mode);
      const blockedAhead =
        actor.direction !== null &&
        !grid.canOccupyWithState(grid.getAdjacentTile(tile, actor.direction), occupant, mode);

      if (!actor.direction || canTurn || blockedAhead) {
        const snapped = grid.snapToTileCenter(actor, tile);
        actor.x = snapped.x;
        actor.y = snapped.y;
      }

      if (actor.bufferedDirection) {
        const requestedTile = grid.getAdjacentTile(tile, actor.bufferedDirection);
        if (grid.canOccupyWithState(requestedTile, occupant, mode)) {
          if (actor.setDirection) {
            actor.setDirection(actor.bufferedDirection);
          } else {
            actor.direction = actor.bufferedDirection;
          }
        }
      }

      if (actor.direction) {
        const nextTile = grid.getAdjacentTile(tile, actor.direction);
        if (!grid.canOccupyWithState(nextTile, occupant, mode)) {
          if (actor.setDirection) {
            actor.setDirection(null);
          } else {
            actor.direction = null;
          }
        }
      }
    }

    if (!actor.direction) {
      return;
    }

    const vector = DIRECTION_VECTORS[actor.direction];
    actor.x += vector.x * actor.speed * deltaSeconds;
    actor.y += vector.y * actor.speed * deltaSeconds;

    const wrapped = grid.applyWrap(actor);
    actor.x = wrapped.x;
    actor.y = wrapped.y;
  }
}
