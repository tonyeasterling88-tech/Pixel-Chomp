import type { Direction, EnemyDefinition, EnemyMode, GridPoint } from '../data/types';
import { DIRECTION_PRIORITY, distanceSquared, translatePoint } from '../utils/grid';

export interface BehaviorContext {
  selfTile: GridPoint;
  spawnDoorTile: GridPoint;
  playerTile: GridPoint;
  playerDirection: Direction | null;
  glintTile: GridPoint;
  frightenedHistory?: GridPoint[];
}

export const chooseScatterTarget = (enemy: EnemyDefinition): GridPoint => enemy.scatterTarget;

export const chooseChaseTarget = (
  enemy: EnemyDefinition,
  context: BehaviorContext,
): GridPoint => {
  switch (enemy.id) {
    case 'drift': {
      if (!context.playerDirection) {
        return context.playerTile;
      }
      return translatePoint(context.playerTile, context.playerDirection, 4);
    }
    case 'vector': {
      const anchor = context.playerDirection
        ? translatePoint(context.playerTile, context.playerDirection, 2)
        : context.playerTile;
      return {
        x: anchor.x + (anchor.x - context.glintTile.x),
        y: anchor.y + (anchor.y - context.glintTile.y),
      };
    }
    case 'mope': {
      const distance = Math.sqrt(distanceSquared(context.selfTile, context.playerTile));
      return distance >= 8 ? context.playerTile : enemy.scatterTarget;
    }
    case 'glint':
    default:
      return context.playerTile;
  }
};

export const chooseTargetTile = (
  enemy: EnemyDefinition,
  mode: EnemyMode,
  context: BehaviorContext,
): GridPoint => {
  if (mode === 'scatter' || mode === 'frightened') {
    return chooseScatterTarget(enemy);
  }

  if (mode === 'returning') {
    return enemy.houseTile;
  }

  if (mode === 'spawn') {
    return context.spawnDoorTile;
  }

  return chooseChaseTarget(enemy, context);
};

export const chooseBestDirection = (
  options: Direction[],
  currentTile: GridPoint,
  targetTile: GridPoint,
): Direction | null => {
  if (options.length === 0) {
    return null;
  }

  const ranked = [...options].sort((left, right) => {
    const leftDistance = distanceSquared(translatePoint(currentTile, left), targetTile);
    const rightDistance = distanceSquared(translatePoint(currentTile, right), targetTile);
    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }
    return DIRECTION_PRIORITY.indexOf(left) - DIRECTION_PRIORITY.indexOf(right);
  });

  return ranked[0] ?? null;
};

export const chooseFrightenedDirection = (
  options: Direction[],
  currentTile: GridPoint,
  frightenedHistory: GridPoint[] = [],
): Direction | null => {
  if (options.length === 0) {
    return null;
  }

  const ranked = [...options].sort((left, right) => {
    const leftTile = translatePoint(currentTile, left);
    const rightTile = translatePoint(currentTile, right);
    const leftRecentIndex = frightenedHistory.findIndex((tile) => tile.x === leftTile.x && tile.y === leftTile.y);
    const rightRecentIndex = frightenedHistory.findIndex((tile) => tile.x === rightTile.x && tile.y === rightTile.y);
    const leftWeight = leftRecentIndex === -1 ? Number.MAX_SAFE_INTEGER : frightenedHistory.length - leftRecentIndex;
    const rightWeight = rightRecentIndex === -1 ? Number.MAX_SAFE_INTEGER : frightenedHistory.length - rightRecentIndex;

    if (leftWeight !== rightWeight) {
      return rightWeight - leftWeight;
    }

    return Math.random() < 0.5 ? -1 : 1;
  });

  return ranked[0] ?? null;
};
