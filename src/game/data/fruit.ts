import type { FruitDefinition } from './types';

export const FRUIT_DEFINITIONS: FruitDefinition[] = [
  { id: 'cherry', spriteKey: 'fruit-cherry', points: 100 },
  { id: 'strawberry', spriteKey: 'fruit-strawberry', points: 300 },
  { id: 'orange', spriteKey: 'fruit-orange', points: 500 },
  { id: 'apple', spriteKey: 'fruit-apple', points: 700 },
  { id: 'melon', spriteKey: 'fruit-melon', points: 1000 },
  { id: 'banana', spriteKey: 'fruit-banana', points: 2000 },
  { id: 'key', spriteKey: 'fruit-key', points: 5000 },
];

export const FRUIT_LIFETIME_MS = 9000;

export const getFruitForRound = (round: number): FruitDefinition => {
  const index = Math.min(Math.max(round, 1) - 1, FRUIT_DEFINITIONS.length - 1);
  return FRUIT_DEFINITIONS[index] ?? FRUIT_DEFINITIONS[0];
};

export const getFruitSpawnThresholds = (totalPellets: number): number[] => {
  if (totalPellets >= 180) {
    return [170, 70];
  }

  const first = Math.max(1, Math.round(totalPellets * 0.62));
  const second = Math.max(1, Math.round(totalPellets * 0.22));
  return first === second ? [first] : [first, second];
};
