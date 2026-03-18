import { SCORE_VALUES } from '../data/scoring';
import { GameEvents } from '../utils/GameEvents';
import { gameEvents } from '../utils/events';
import { SaveManager } from './SaveManager';

export interface ScoreSnapshot {
  score: number;
  highScore: number;
  comboIndex: number;
  extraLifeEarned: boolean;
}

export class ScoreManager {
  private score = 0;
  private highScore: number;
  private comboIndex = 0;
  private extraLifeEarned = false;

  constructor(private readonly saveManager: SaveManager) {
    this.highScore = saveManager.getHighScore();
  }

  resetGame(): void {
    this.score = 0;
    this.comboIndex = 0;
    this.extraLifeEarned = false;
    this.highScore = this.saveManager.getHighScore();
    this.emit();
  }

  restoreGame(score: number): void {
    this.score = Math.max(0, Math.floor(score));
    this.comboIndex = 0;
    this.extraLifeEarned = false;
    this.highScore = Math.max(this.saveManager.getHighScore(), this.score);
    this.emit();
  }

  awardPellet(power = false): number {
    this.add(power ? SCORE_VALUES.powerPellet : SCORE_VALUES.pellet);
    if (power) {
      this.comboIndex = 0;
      this.emit();
    }
    return power ? SCORE_VALUES.powerPellet : SCORE_VALUES.pellet;
  }

  resetEnemyCombo(): void {
    this.comboIndex = 0;
    this.emit();
  }

  awardEnemyCombo(): number {
    const points = SCORE_VALUES.enemyCombo[Math.min(this.comboIndex, SCORE_VALUES.enemyCombo.length - 1)] ?? 0;
    this.comboIndex += 1;
    this.add(points);
    return points;
  }

  awardFruit(points: number): number {
    this.add(points);
    return points;
  }

  add(points: number): void {
    this.score += points;

    if (!this.extraLifeEarned && this.score >= SCORE_VALUES.extraLifeAt) {
      this.extraLifeEarned = true;
    }

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveManager.setHighScore(this.highScore);
    }

    this.emit();
  }

  consumeExtraLifeFlag(): boolean {
    if (!this.extraLifeEarned) {
      return false;
    }

    this.extraLifeEarned = false;
    this.emit();
    return true;
  }

  getSnapshot(): ScoreSnapshot {
    return {
      score: this.score,
      highScore: this.highScore,
      comboIndex: this.comboIndex,
      extraLifeEarned: this.extraLifeEarned,
    };
  }

  private emit(): void {
    gameEvents.emit(GameEvents.ScoreChanged, this.getSnapshot());
  }
}
