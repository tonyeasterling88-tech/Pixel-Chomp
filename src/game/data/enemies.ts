import type { EnemyDefinition } from './types';

export const ENEMY_DEFINITIONS: EnemyDefinition[] = [
  {
    id: 'glint',
    displayName: 'Glint',
    spriteKey: 'ghost-red',
    scatterTarget: { x: 19, y: 0 },
    houseTile: { x: 10, y: 7 },
    release: { delayMs: 0, pelletsEaten: 0 },
    description: 'Direct pressure unit that prefers to close distance quickly.',
  },
  {
    id: 'drift',
    displayName: 'Drift',
    spriteKey: 'ghost-pink',
    scatterTarget: { x: 1, y: 0 },
    houseTile: { x: 9, y: 8 },
    release: { delayMs: 2500, pelletsEaten: 0 },
    description: 'Predictive ambusher that likes space ahead of the player.',
  },
  {
    id: 'vector',
    displayName: 'Vector',
    spriteKey: 'ghost-cyan',
    scatterTarget: { x: 19, y: 16 },
    houseTile: { x: 10, y: 8 },
    release: { delayMs: 5000, pelletsEaten: 18 },
    description: 'Angle-maker that thrives on unusual approach lines.',
  },
  {
    id: 'mope',
    displayName: 'Mope',
    spriteKey: 'ghost-orange',
    scatterTarget: { x: 1, y: 16 },
    houseTile: { x: 11, y: 8 },
    release: { delayMs: 8500, pelletsEaten: 44 },
    description: 'Reactive roamer that flips between pursuit and hesitation.',
  },
];
