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

  return {
    round: safeRound,
    mazeKey: 'maze01',
    playerSpeed: 104 + speedStep * 4,
    enemySpeed: 92 + speedStep * 4,
    frightenedSpeed: 74 + Math.min(speedStep, 3) * 2,
    returningSpeed: 156,
    tunnelSpeedMultiplier: 0.72,
    frightenedDurationMs: Math.max(1400, 6000 - (safeRound - 1) * 700),
    frightenedFlashMs: 1800,
    introDelayMs: safeRound === 1 ? 1200 : 800,
    respawnDelayMs: 1400,
    startingLives: 3,
    modeSchedule: BASE_MODE_SCHEDULE,
  };
};
