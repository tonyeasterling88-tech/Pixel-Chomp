export type Direction = 'up' | 'left' | 'down' | 'right';

export interface GridPoint {
  x: number;
  y: number;
}

export type TileType =
  | 'wall'
  | 'floor'
  | 'pellet'
  | 'power-pellet'
  | 'player-spawn'
  | 'enemy-spawn'
  | 'ghost-door'
  | 'fruit-spawn'
  | 'tunnel';

export interface MazeTile {
  x: number;
  y: number;
  symbol: string;
  type: TileType;
  walkable: boolean;
  collectible: boolean;
}

export interface MazeDefinition {
  key: string;
  name: string;
  tileSize: number;
  layout: string[];
}

export type GlobalEnemyMode = 'scatter' | 'chase';
export type RoundState = 'intro' | 'playing' | 'paused' | 'respawning' | 'round-clear' | 'game-over';

export interface ModePhase {
  mode: GlobalEnemyMode;
  durationMs: number | null;
}

export interface RoundConfig {
  round: number;
  mazeKey: string;
  playerSpeed: number;
  enemySpeed: number;
  frightenedSpeed: number;
  returningSpeed: number;
  tunnelSpeedMultiplier: number;
  frightenedDurationMs: number;
  frightenedFlashMs: number;
  introDelayMs: number;
  respawnDelayMs: number;
  startingLives: number;
  modeSchedule: ModePhase[];
}

export type EnemyMode = 'spawn' | 'scatter' | 'chase' | 'frightened' | 'returning';

export interface EnemyReleaseRule {
  delayMs: number;
  pelletsEaten: number;
}

export interface EnemyDefinition {
  id: string;
  displayName: string;
  spriteKey: string;
  scatterTarget: GridPoint;
  houseTile: GridPoint;
  release: EnemyReleaseRule;
  description: string;
}

export interface CollectibleState {
  tile: GridPoint;
  type: Extract<TileType, 'pellet' | 'power-pellet'>;
  collected: boolean;
}

export interface FruitDefinition {
  id: 'cherry' | 'strawberry' | 'orange' | 'apple' | 'melon' | 'banana' | 'key';
  spriteKey: string;
  points: number;
}
