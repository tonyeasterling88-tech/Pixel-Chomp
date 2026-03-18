import { getMazeForRound } from './mazes';
import type { ModePhase, RoundConfig } from './types';

const BASE_MODE_SCHEDULE: ModePhase[] = [
  { mode: 'scatter', durationMs: 7000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 7000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: 20000 },
  { mode: 'scatter', durationMs: 5000 },
  { mode: 'chase', durationMs: null },
];

export const getRoundConfig = (round: number): RoundConfig => {
  const safeRound = Math.max(1, round);
  const speedStep = Math.min(safeRound - 1, 6);
  const roundGroup = Math.floor((safeRound - 1) / 2);
  const musicRotation = ['musicMazeChase', 'musicRetroChase', 'musicThisIsIt', 'musicLetsGo'] as const;
  const maze = getMazeForRound(safeRound);

  return {
    round: safeRound,
    mazeKey: maze.key,
    musicKey: musicRotation[roundGroup % musicRotation.length],
    playerSpeed: 104 + speedStep * 4,
    enemySpeed: 84 + speedStep * 3,
    frightenedSpeed: 68 + Math.min(speedStep, 3),
    returningSpeed: 156,
    tunnelSpeedMultiplier: 0.68,
    frightenedDurationMs: Math.max(3000, 8000 - (safeRound - 1) * 500),
    frightenedFlashMs: 2000,
    introDelayMs: safeRound === 1 ? 1200 : 800,
    respawnDelayMs: 1400,
    startingLives: 3,
    modeSchedule: BASE_MODE_SCHEDULE,
  };
};
