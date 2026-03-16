import type { Direction, GridPoint } from '../data/types';

export const DIRECTION_PRIORITY: Direction[] = ['up', 'left', 'down', 'right'];

export const DIRECTION_VECTORS: Record<Direction, GridPoint> = {
  up: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  down: { x: 0, y: 1 },
  right: { x: 1, y: 0 },
};

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: 'down',
  left: 'right',
  down: 'up',
  right: 'left',
};

export const addGridPoints = (a: GridPoint, b: GridPoint): GridPoint => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const gridPointToKey = ({ x, y }: GridPoint): string => `${x},${y}`;

export const sameGridPoint = (a: GridPoint, b: GridPoint): boolean => a.x === b.x && a.y === b.y;

export const distanceSquared = (a: GridPoint, b: GridPoint): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};

export const translatePoint = (point: GridPoint, direction: Direction, steps = 1): GridPoint => {
  const vector = DIRECTION_VECTORS[direction];
  return {
    x: point.x + vector.x * steps,
    y: point.y + vector.y * steps,
  };
};
