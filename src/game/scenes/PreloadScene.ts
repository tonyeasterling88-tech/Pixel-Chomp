import Phaser from 'phaser';
import { GAME_CENTER_X, GAME_CENTER_Y } from '../config';
import { AUDIO_ASSETS } from '../data/audio';
import { SceneKeys } from '../utils/SceneKeys';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Preload);
  }

  preload(): void {
    const progressBox = this.add.rectangle(GAME_CENTER_X, GAME_CENTER_Y, 280, 20, 0x101b2d, 0.95);
    progressBox.setStrokeStyle(2, 0x3ebfb5, 0.45);

    const progressBar = this.add
      .rectangle(GAME_CENTER_X - 138, GAME_CENTER_Y, 0, 10, 0xffd166, 1)
      .setOrigin(0, 0.5);

    const label = this.add
      .text(GAME_CENTER_X, GAME_CENTER_Y - 38, 'LOADING PIXEL CHOMP', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '22px',
        color: '#f9f8ef',
      })
      .setOrigin(0.5);

    this.load.image('pixel-chomp-logo', 'assets/images/pixel-chomp-logo.png');
    this.load.image('maze-tile', 'assets/sprites/maze-tile.png');
    this.load.image('pellet', 'assets/sprites/pellet.png');
    this.load.image('power-pellet', 'assets/sprites/power-pellet.png');
    this.load.image('ghost-red', 'assets/sprites/ghost-red.png');
    this.load.image('ghost-pink', 'assets/sprites/ghost-pink.png');
    this.load.image('ghost-cyan', 'assets/sprites/ghost-cyan.png');
    this.load.image('ghost-orange', 'assets/sprites/ghost-orange.png');
    this.load.image('ghost-frightened', 'assets/sprites/ghost-frightened.png');
    this.load.image('ghost-eyes', 'assets/sprites/ghost-eyes.png');
    this.load.image('fruit-cherry', 'assets/sprites/fruit-cherry.png');
    this.load.image('fruit-strawberry', 'assets/sprites/fruit-strawberry.png');
    this.load.image('fruit-orange', 'assets/sprites/fruit-orange.png');
    this.load.image('fruit-apple', 'assets/sprites/fruit-apple.png');
    this.load.image('fruit-melon', 'assets/sprites/fruit-melon.png');
    this.load.image('fruit-banana', 'assets/sprites/fruit-banana.png');
    this.load.image('fruit-key', 'assets/sprites/fruit-key.png');
    this.load.spritesheet('player-chomp', 'assets/sprites/player-chomp.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    Object.entries(AUDIO_ASSETS).forEach(([key, path]) => {
      this.load.audio(key, path);
    });

    this.load.on('progress', (value: number) => {
      progressBar.width = 276 * value;
    });

    this.load.once('complete', () => {
      progressBox.destroy();
      progressBar.destroy();
      label.destroy();
      if (!this.anims.exists('player-chomp')) {
        this.anims.create({
          key: 'player-chomp',
          frames: this.anims.generateFrameNumbers('player-chomp', { start: 0, end: 3 }),
          frameRate: 12,
          repeat: -1,
        });
      }
      this.scene.start(SceneKeys.MainMenu);
    });
  }
}
