import Phaser from 'phaser';
import { Hud } from '../ui/Hud';
import { GameEvents } from '../utils/GameEvents';
import { gameEvents } from '../utils/events';
import { SceneKeys } from '../utils/SceneKeys';
import type { RoundSnapshot } from '../systems/RoundManager';
import type { ScoreSnapshot } from '../systems/ScoreManager';

export class UIScene extends Phaser.Scene {
  private hud!: Hud;
  private latestRound?: RoundSnapshot;

  constructor() {
    super(SceneKeys.UI);
  }

  create(): void {
    this.hud = new Hud(this);

    gameEvents.on(GameEvents.ScoreChanged, this.handleScoreChanged, this);
    gameEvents.on(GameEvents.RoundChanged, this.handleRoundChanged, this);
    gameEvents.on(GameEvents.PausedChanged, this.handlePauseChanged, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameEvents.off(GameEvents.ScoreChanged, this.handleScoreChanged, this);
      gameEvents.off(GameEvents.RoundChanged, this.handleRoundChanged, this);
      gameEvents.off(GameEvents.PausedChanged, this.handlePauseChanged, this);
    });
  }

  private handleScoreChanged(snapshot: ScoreSnapshot): void {
    this.hud.setScore(snapshot);
  }

  private handleRoundChanged(snapshot: RoundSnapshot): void {
    this.latestRound = snapshot;
    this.hud.setRound(snapshot, Math.max(snapshot.frightenedDurationMs, 1));
    this.syncOverlay(snapshot);
  }

  private handlePauseChanged(paused: boolean): void {
    if (!this.latestRound) {
      return;
    }

    this.syncOverlay({
      ...this.latestRound,
      state: paused ? 'paused' : this.latestRound.state,
    });
  }

  private syncOverlay(snapshot: RoundSnapshot): void {
    if (snapshot.state === 'paused') {
      this.hud.setOverlay('Paused', 'Press Escape to jump back in.', true);
      return;
    }

    if (snapshot.state === 'intro') {
      this.hud.setOverlay('Ready?', 'Clear the board.\nPower pellets flip the chase.', true);
      return;
    }

    if (snapshot.state === 'respawning') {
      this.hud.setOverlay('Respawn', 'Catch your breath.\nThe chase resumes in a moment.', true);
      return;
    }

    this.hud.setOverlay('', '', false);
  }
}
