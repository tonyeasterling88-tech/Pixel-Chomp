import type { MazeDefinition } from '../types';
import { maze01 } from './maze01';
import { maze02 } from './maze02';
import { maze03 } from './maze03';

export const MAZE_ROTATION: MazeDefinition[] = [maze01, maze02, maze03];

export const MAZES_BY_KEY: Record<string, MazeDefinition> = Object.fromEntries(
  MAZE_ROTATION.map((maze) => [maze.key, maze]),
);

export const getMazeForRound = (round: number): MazeDefinition => {
  const index = Math.floor((Math.max(1, round) - 1) / 2) % MAZE_ROTATION.length;
  return MAZE_ROTATION[index] ?? maze01;
};

export const getMazeByKey = (mazeKey: string): MazeDefinition => MAZES_BY_KEY[mazeKey] ?? maze01;
