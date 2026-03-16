import Phaser from 'phaser';
import { GAME_CENTER_X, GAME_CENTER_Y } from '../config';
import { createMenuCard } from '../ui/Menus';
import { createMenuKeys } from '../utils/input';
import { SceneKeys } from '../utils/SceneKeys';

interface GameOverData {
  score?: number;
  highScore?: number;
  round?: number;
}

export class GameOverScene extends Phaser.Scene {
  private score = 0;
  private highScore = 0;
  private round = 1;

  constructor() {
    super(SceneKeys.GameOver);
  }

  init(data: GameOverData): void {
    this.score = data.score ?? 0;
    this.highScore = data.highScore ?? this.score;
    this.round = data.round ?? 1;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#05080f');
    createMenuCard(this, GAME_CENTER_X, GAME_CENTER_Y, 420, 250);

    this.add
      .text(GAME_CENTER_X, 180, 'GAME OVER', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '36px',
        color: '#ff6b6b',
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_CENTER_X,
        252,
        `Score ${this.score.toString().padStart(6, '0')}\nHigh ${this.highScore
          .toString()
          .padStart(6, '0')}\nRound ${this.round}`,
        {
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '22px',
          color: '#f9f8ef',
          align: 'center',
          lineSpacing: 12,
        },
      )
      .setOrigin(0.5);

    this.add
      .text(GAME_CENTER_X, 352, 'Press Enter or tap to return to menu', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '20px',
        color: '#ffd166',
      })
      .setOrigin(0.5);

    const keys = createMenuKeys(this.input);
    keys.confirm.once('down', () => this.scene.start(SceneKeys.MainMenu));
    this.input.once('pointerdown', () => this.scene.start(SceneKeys.MainMenu));
  }
}
