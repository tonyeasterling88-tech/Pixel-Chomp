import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';
import type { Direction } from '../data/types';

export class MobileControls {
  private readonly container: Phaser.GameObjects.Container;
  private readonly pauseBounds: Phaser.Geom.Circle;
  private readonly swipeHint: Phaser.GameObjects.Text;
  private requestedDirection: Direction | null = null;
  private swipeStart?: { x: number; y: number };

  constructor(scene: Phaser.Scene, onPause: () => void) {
    this.container = scene.add.container(0, 0).setDepth(30).setScrollFactor(0);

    const pauseX = GAME_WIDTH - 48;
    const pauseY = GAME_HEIGHT - 52;
    this.pauseBounds = new Phaser.Geom.Circle(pauseX, pauseY, 34);

    const pauseButton = scene.add
      .circle(pauseX, pauseY, 30, 0x101b2d, 0.34)
      .setStrokeStyle(2, 0x3ebfb5, 0.28);
    const pauseLabel = scene.add
      .text(pauseX, pauseY, 'II', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '20px',
        color: '#f9f8ef',
      })
      .setOrigin(0.5);

    this.swipeHint = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 28, 'Swipe anywhere to move', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '16px',
        color: '#8fb9d5',
      })
      .setOrigin(0.5);

    scene.tweens.add({
      targets: this.swipeHint,
      alpha: 0.28,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    pauseButton.setInteractive();
    pauseButton.on('pointerdown', () => onPause());

    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (Phaser.Geom.Circle.Contains(this.pauseBounds, pointer.x, pointer.y)) {
        this.swipeStart = undefined;
        return;
      }

      this.swipeStart = { x: pointer.x, y: pointer.y };
    });

    scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!Phaser.Geom.Circle.Contains(this.pauseBounds, pointer.x, pointer.y)) {
        this.captureSwipe(pointer);
      }
    });

    scene.input.on('gameout', () => {
      this.swipeStart = undefined;
    });

    this.container.add([pauseButton, pauseLabel, this.swipeHint]);
  }

  getRequestedDirection(): Direction | null {
    return this.requestedDirection;
  }

  clearRequestedDirection(): void {
    this.requestedDirection = null;
  }

  destroy(): void {
    this.container.destroy(true);
  }

  private captureSwipe(pointer: Phaser.Input.Pointer): void {
    if (!this.swipeStart) {
      return;
    }

    const dx = pointer.x - this.swipeStart.x;
    const dy = pointer.y - this.swipeStart.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 28;

    if (Math.max(absX, absY) < threshold) {
      this.swipeStart = undefined;
      return;
    }

    this.requestedDirection = absX > absY ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
    this.swipeStart = undefined;
  }
}
