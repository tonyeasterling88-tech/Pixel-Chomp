import Phaser from 'phaser';
import { GAME_CENTER_X, GAME_CENTER_Y, GAME_HEIGHT, GAME_WIDTH } from '../config';

export class FXManager {
  constructor(private readonly scene: Phaser.Scene) {}

  pulse(target: Phaser.GameObjects.GameObject): void {
    this.scene.tweens.add({
      targets: target,
      duration: 140,
      scaleX: 1.06,
      scaleY: 1.06,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  popupScore(x: number, y: number, message: string, color = '#f7e8c4'): void {
    const text = this.scene.add.text(x, y, message, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '18px',
      color,
      stroke: '#05080f',
      strokeThickness: 6,
    });

    text.setOrigin(0.5).setDepth(10);

    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      y: y - 22,
      duration: 900,
      ease: 'Quad.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  flashMessage(message: string): void {
    const text = this.scene.add.text(GAME_CENTER_X, GAME_HEIGHT - 14, message, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '18px',
      color: '#f7e8c4',
      stroke: '#05080f',
      strokeThickness: 6,
    });

    text.setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      y: text.y - 20,
      duration: 900,
      ease: 'Quad.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  flashScreen(color = 0xffd166, alpha = 0.24, duration = 160): void {
    const overlay = this.scene.add
      .rectangle(GAME_CENTER_X, GAME_CENTER_Y, GAME_WIDTH, GAME_HEIGHT, color, alpha)
      .setDepth(20)
      .setScrollFactor(0);

    this.scene.tweens.add({
      targets: overlay,
      alpha: 0,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => overlay.destroy(),
    });
  }

  nudgeCamera(intensity = 0.003, duration = 160): void {
    this.scene.cameras.main.shake(duration, intensity);
  }
}
