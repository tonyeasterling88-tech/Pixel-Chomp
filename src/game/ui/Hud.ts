import Phaser from 'phaser';
import { GAME_CENTER_X, GAME_CENTER_Y, GAME_WIDTH, HUD_HEIGHT } from '../config';
import type { RoundSnapshot } from '../systems/RoundManager';
import type { ScoreSnapshot } from '../systems/ScoreManager';

export class Hud {
  private readonly scoreValue: Phaser.GameObjects.Text;
  private readonly highScoreValue: Phaser.GameObjects.Text;
  private readonly roundValue: Phaser.GameObjects.Text;
  private readonly livesValue: Phaser.GameObjects.Text;
  private readonly pelletsValue: Phaser.GameObjects.Text;
  private readonly powerBarFill: Phaser.GameObjects.Rectangle;
  private readonly powerBarFrame: Phaser.GameObjects.Rectangle;
  private readonly overlay: Phaser.GameObjects.Container;
  private readonly overlayTitle: Phaser.GameObjects.Text;
  private readonly overlayBody: Phaser.GameObjects.Text;
  private readonly compact: boolean;

  constructor(scene: Phaser.Scene) {
    this.compact = scene.sys.game.device.input.touch;

    scene.add.rectangle(0, 0, GAME_WIDTH, HUD_HEIGHT, 0x101b2d, 0.95).setOrigin(0);
    scene.add.rectangle(GAME_CENTER_X, HUD_HEIGHT, GAME_WIDTH, 2, 0x3ebfb5, 0.24).setOrigin(0.5, 0);

    this.scoreValue = this.createLabel(scene, 20, 14, this.compact ? 'S 000000' : 'SCORE 000000');
    this.highScoreValue = this.createLabel(scene, 178, 14, this.compact ? 'HI 000000' : 'HI 000000');
    this.roundValue = this.createLabel(scene, 348, 14, this.compact ? 'R 1' : 'ROUND 1');
    this.livesValue = this.createLabel(scene, 464, 14, this.compact ? 'L 3' : 'LIVES 3');
    this.pelletsValue = this.createLabel(scene, 572, 14, this.compact ? 'P 0' : 'PELLETS 0');

    scene.add.text(20, 48, this.compact ? 'POWER' : 'POWER', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: this.compact ? '14px' : '16px',
      color: '#8fb9d5',
    });

    this.powerBarFrame = scene.add
      .rectangle(98, 58, this.compact ? 170 : 220, 12, 0x09111d, 1)
      .setOrigin(0, 0.5);
    this.powerBarFrame.setStrokeStyle(1, 0xffd166, 0.45);
    this.powerBarFill = scene.add.rectangle(100, 58, 0, 8, 0xffd166, 1).setOrigin(0, 0.5);

    this.overlay = scene.add.container(GAME_CENTER_X, GAME_CENTER_Y + 20);
    const backdrop = scene.add.rectangle(0, 0, 320, 164, 0x09111d, 0.9);
    backdrop.setStrokeStyle(2, 0x3ebfb5, 0.32);
    const inner = scene.add.rectangle(0, 0, 296, 138, 0x101b2d, 0.96);
    inner.setStrokeStyle(1, 0xffffff, 0.08);
    this.overlayTitle = scene.add
      .text(0, -34, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '28px',
        color: '#ffd166',
      })
      .setOrigin(0.5);
    this.overlayBody = scene.add
      .text(0, 22, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '17px',
        color: '#dce8f2',
        align: 'center',
        lineSpacing: 8,
      })
      .setOrigin(0.5);
    this.overlay.add([backdrop, inner, this.overlayTitle, this.overlayBody]);
    this.overlay.setVisible(false);
  }

  setScore(snapshot: ScoreSnapshot): void {
    this.scoreValue.setText(`${this.compact ? 'S' : 'SCORE'} ${snapshot.score.toString().padStart(6, '0')}`);
    this.highScoreValue.setText(`HI ${snapshot.highScore.toString().padStart(6, '0')}`);
  }

  setRound(snapshot: RoundSnapshot, frightenedDurationMs: number): void {
    this.roundValue.setText(`${this.compact ? 'R' : 'ROUND'} ${snapshot.round}`);
    this.livesValue.setText(`${this.compact ? 'L' : 'LIVES'} ${snapshot.lives}`);
    this.pelletsValue.setText(`${this.compact ? 'P' : 'PELLETS'} ${snapshot.pelletsRemaining}`);

    const ratio =
      frightenedDurationMs > 0 ? Math.max(0, snapshot.frightenedRemainingMs / frightenedDurationMs) : 0;
    this.powerBarFill.width = Math.floor((this.compact ? 166 : 216) * ratio);
    this.powerBarFill.fillColor = snapshot.frightenedFlashing ? 0xff6b6b : 0xffd166;
  }

  setOverlay(title: string, body: string, visible: boolean): void {
    this.overlayTitle.setText(title);
    this.overlayBody.setText(body);
    this.overlay.setVisible(visible);
  }

  private createLabel(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
  ): Phaser.GameObjects.Text {
    return scene.add.text(x, y, text, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: this.compact ? '18px' : '21px',
      color: '#f9f8ef',
      stroke: '#05080f',
      strokeThickness: this.compact ? 4 : 5,
    });
  }
}
