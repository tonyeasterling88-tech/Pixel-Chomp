import { getRoundConfig } from '../data/rounds';
import type { GlobalEnemyMode, RoundConfig, RoundState } from '../data/types';
import { GameEvents } from '../utils/GameEvents';
import { gameEvents } from '../utils/events';

export interface RoundSnapshot {
  round: number;
  lives: number;
  pelletsRemaining: number;
  state: RoundState;
  globalMode: GlobalEnemyMode;
  frightenedDurationMs: number;
  frightenedRemainingMs: number;
  frightenedActive: boolean;
  frightenedFlashing: boolean;
}

interface TickResult {
  modeChanged: boolean;
  frightenedExpired: boolean;
}

export class RoundManager {
  private round = 1;
  private lives = getRoundConfig(1).startingLives;
  private pelletsRemaining = 0;
  private state: RoundState = 'intro';
  private globalMode: GlobalEnemyMode = 'scatter';
  private phaseIndex = 0;
  private phaseElapsedMs = 0;
  private frightenedRemainingMs = 0;
  private frightenedDurationMs = 0;
  private frightenedFlashMs = 0;

  startNewGame(totalPellets: number): void {
    this.round = 1;
    this.lives = getRoundConfig(1).startingLives;
    this.beginRound(totalPellets);
  }

  beginRound(totalPellets: number): void {
    this.pelletsRemaining = totalPellets;
    this.state = 'intro';
    this.globalMode = 'scatter';
    this.phaseIndex = 0;
    this.phaseElapsedMs = 0;
    this.frightenedRemainingMs = 0;
    this.frightenedDurationMs = 0;
    this.frightenedFlashMs = 0;
    this.emit();
  }

  setPlaying(): void {
    this.state = 'playing';
    this.emit();
  }

  setPaused(paused: boolean): void {
    this.state = paused ? 'paused' : 'playing';
    gameEvents.emit(GameEvents.PausedChanged, paused);
    this.emit();
  }

  setRespawning(): void {
    this.state = 'respawning';
    this.emit();
  }

  setRoundClear(): void {
    this.state = 'round-clear';
    gameEvents.emit(GameEvents.RoundCleared, this.getSnapshot());
    this.emit();
  }

  advanceRound(totalPellets: number): void {
    this.round += 1;
    this.beginRound(totalPellets);
  }

  addLife(): void {
    this.lives += 1;
    this.emit();
  }

  loseLife(): boolean {
    this.lives = Math.max(0, this.lives - 1);
    this.state = this.lives > 0 ? 'respawning' : 'game-over';
    this.emit();

    if (this.lives === 0) {
      gameEvents.emit(GameEvents.GameOver, this.getSnapshot());
      return true;
    }

    return false;
  }

  consumePellet(): number {
    this.pelletsRemaining = Math.max(0, this.pelletsRemaining - 1);
    this.emit();
    return this.pelletsRemaining;
  }

  triggerPowerMode(durationMs: number, flashMs: number): void {
    this.frightenedRemainingMs = durationMs;
    this.frightenedDurationMs = durationMs;
    this.frightenedFlashMs = flashMs;
    this.emit();
  }

  clearPowerMode(): void {
    this.frightenedRemainingMs = 0;
    this.frightenedDurationMs = 0;
    this.frightenedFlashMs = 0;
    this.emit();
  }

  tick(deltaMs: number): TickResult {
    let modeChanged = false;
    let frightenedExpired = false;

    if (this.state !== 'playing') {
      return { modeChanged, frightenedExpired };
    }

    if (this.frightenedRemainingMs > 0) {
      this.frightenedRemainingMs = Math.max(0, this.frightenedRemainingMs - deltaMs);
      frightenedExpired = this.frightenedRemainingMs === 0;
      this.emit();
      return { modeChanged, frightenedExpired };
    }

    const config = this.getCurrentConfig();
    const phase = config.modeSchedule[this.phaseIndex];

    if (!phase || phase.durationMs === null) {
      return { modeChanged, frightenedExpired };
    }

    this.phaseElapsedMs += deltaMs;
    if (this.phaseElapsedMs >= phase.durationMs) {
      this.phaseElapsedMs = 0;
      this.phaseIndex = Math.min(this.phaseIndex + 1, config.modeSchedule.length - 1);
      const nextMode = config.modeSchedule[this.phaseIndex]?.mode ?? this.globalMode;
      if (nextMode !== this.globalMode) {
        this.globalMode = nextMode;
        modeChanged = true;
      }
      this.emit();
    }

    return { modeChanged, frightenedExpired };
  }

  getCurrentConfig(): RoundConfig {
    return getRoundConfig(this.round);
  }

  getSnapshot(): RoundSnapshot {
    return {
      round: this.round,
      lives: this.lives,
      pelletsRemaining: this.pelletsRemaining,
      state: this.state,
      globalMode: this.globalMode,
      frightenedDurationMs: this.frightenedDurationMs,
      frightenedRemainingMs: this.frightenedRemainingMs,
      frightenedActive: this.frightenedRemainingMs > 0,
      frightenedFlashing:
        this.frightenedRemainingMs > 0 && this.frightenedRemainingMs <= this.frightenedFlashMs,
    };
  }

  private emit(): void {
    gameEvents.emit(GameEvents.RoundChanged, this.getSnapshot());
  }
}
