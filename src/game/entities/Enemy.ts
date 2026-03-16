import Phaser from 'phaser';
import { EnemyBrain } from '../ai/EnemyBrain';
import type { Direction, EnemyDefinition, EnemyMode, GridPoint } from '../data/types';

export class Enemy extends Phaser.GameObjects.Sprite {
  readonly brain: EnemyBrain;
  readonly definition: EnemyDefinition;
  direction: Direction | null = 'up';
  bufferedDirection: Direction | null = 'up';
  currentTile: GridPoint;
  readonly spawnTile: GridPoint;
  speed = 0;
  mode: EnemyMode = 'spawn';
  released = false;
  flashing = false;
  isLeavingHouse = false;
  isReturningHome = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    definition: EnemyDefinition,
    spawnTile: GridPoint,
    scale: number,
  ) {
    super(scene, x, y, definition.spriteKey);
    this.definition = definition;
    this.spawnTile = { ...spawnTile };
    this.currentTile = { ...spawnTile };
    this.brain = new EnemyBrain(definition);
    scene.add.existing(this);
    this.setDepth(4);
    this.setScale(scale);
  }

  resetTo(tile: GridPoint, world: GridPoint): void {
    this.currentTile = { ...tile };
    this.direction = 'up';
    this.bufferedDirection = 'up';
    this.mode = 'spawn';
    this.released = this.definition.release.delayMs === 0 && this.definition.release.pelletsEaten === 0;
    this.isLeavingHouse = this.released;
    this.isReturningHome = false;
    this.flashing = false;
    this.clearTint();
    this.setTexture(this.definition.spriteKey);
    this.setPosition(world.x, world.y);
    this.setVisible(true);
  }

  setMode(mode: EnemyMode): void {
    this.mode = mode;
    if (mode === 'returning') {
      this.isReturningHome = true;
      this.isLeavingHouse = false;
    } else if (mode !== 'spawn') {
      this.isReturningHome = false;
      this.isLeavingHouse = false;
    }
    this.brain.setMode(mode);
    this.syncTexture();
  }

  setDirection(direction: Direction | null): void {
    this.direction = direction;
    this.bufferedDirection = direction;
  }

  reverseDirection(): void {
    switch (this.direction) {
      case 'up':
        this.direction = 'down';
        break;
      case 'down':
        this.direction = 'up';
        break;
      case 'left':
        this.direction = 'right';
        break;
      case 'right':
        this.direction = 'left';
        break;
      default:
        break;
    }
    this.bufferedDirection = this.direction;
  }

  setFlashing(flashing: boolean): void {
    this.flashing = flashing;
    this.syncTexture();
  }

  private syncTexture(): void {
    if (this.mode === 'returning') {
      this.setTexture('ghost-eyes');
      this.clearTint();
      return;
    }

    if (this.mode === 'frightened') {
      this.setTexture('ghost-frightened');
      if (this.flashing) {
        this.setTint(0xfff3b0);
      } else {
        this.clearTint();
      }
      return;
    }

    this.setTexture(this.definition.spriteKey);
    this.clearTint();
  }
}
