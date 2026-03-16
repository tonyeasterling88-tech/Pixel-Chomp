import Phaser from 'phaser';
import type { Direction, GridPoint } from '../data/types';

export type PlayerState = 'normal' | 'powered' | 'dying' | 'respawning';

export class Player extends Phaser.GameObjects.Sprite {
  direction: Direction | null = 'left';
  bufferedDirection: Direction | null = 'left';
  currentTile: GridPoint;
  readonly spawnTile: GridPoint;
  speed = 0;
  state: PlayerState = 'normal';

  constructor(scene: Phaser.Scene, x: number, y: number, spawnTile: GridPoint, scale: number) {
    super(scene, x, y, 'player-chomp', 0);
    this.spawnTile = { ...spawnTile };
    this.currentTile = { ...spawnTile };
    scene.add.existing(this);
    this.setDepth(5);
    this.setScale(scale);
    this.play('player-chomp');
    this.applyDirectionVisual();
  }

  resetTo(tile: GridPoint, world: GridPoint): void {
    this.currentTile = { ...tile };
    this.direction = 'left';
    this.bufferedDirection = 'left';
    this.state = 'normal';
    this.clearTint();
    this.setPosition(world.x, world.y);
    this.setVisible(true);
    this.applyDirectionVisual();
  }

  setDirection(direction: Direction | null): void {
    this.direction = direction;
    this.applyDirectionVisual();
  }

  setPowered(powered: boolean): void {
    this.state = powered ? 'powered' : 'normal';
    if (powered) {
      this.setTint(0xfff3b0);
    } else {
      this.clearTint();
    }
  }

  setPlayerState(state: PlayerState): void {
    this.state = state;
    if (state === 'dying') {
      this.setTint(0xff8c69);
    } else if (state !== 'powered') {
      this.clearTint();
    }
  }

  private applyDirectionVisual(): void {
    switch (this.direction) {
      case 'up':
        this.setAngle(-90);
        break;
      case 'down':
        this.setAngle(90);
        break;
      case 'right':
        this.setAngle(0);
        break;
      case 'left':
      default:
        this.setAngle(180);
        break;
    }
  }
}
