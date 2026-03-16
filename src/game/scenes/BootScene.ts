import Phaser from 'phaser';
import { SceneKeys } from '../utils/SceneKeys';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Boot);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#05080f');
    this.scene.start(SceneKeys.Preload);
  }
}
