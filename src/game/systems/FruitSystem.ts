import Phaser from 'phaser';
import { FRUIT_LIFETIME_MS, getFruitForRound, getFruitSpawnThresholds } from '../data/fruit';
import type { FruitDefinition, GridPoint } from '../data/types';
import { GridManager } from './GridManager';

interface ActiveFruit {
  definition: FruitDefinition;
  tile: GridPoint;
  remainingMs: number;
}

export class FruitSystem {
  private thresholds: number[] = [];
  private triggeredThresholds = new Set<number>();
  private activeFruit?: ActiveFruit;
  private fruitSprite?: Phaser.GameObjects.Image;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly grid: GridManager,
  ) {}

  reset(round: number, totalPellets: number): void {
    this.clearFruit();
    this.thresholds = getFruitSpawnThresholds(totalPellets);
    this.triggeredThresholds.clear();
    this.activeFruit = undefined;
    void round;
  }

  update(deltaMs: number, pelletsRemaining: number, round: number): void {
    for (const threshold of this.thresholds) {
      if (pelletsRemaining <= threshold && !this.triggeredThresholds.has(threshold) && !this.activeFruit) {
        this.spawn(round);
        this.triggeredThresholds.add(threshold);
        break;
      }
    }

    if (!this.activeFruit) {
      return;
    }

    this.activeFruit.remainingMs = Math.max(0, this.activeFruit.remainingMs - deltaMs);
    if (this.activeFruit.remainingMs === 0) {
      this.clearFruit();
    }
  }

  collectAt(tile: GridPoint): FruitDefinition | null {
    if (!this.activeFruit) {
      return null;
    }

    if (this.activeFruit.tile.x !== tile.x || this.activeFruit.tile.y !== tile.y) {
      return null;
    }

    const definition = this.activeFruit.definition;
    this.clearFruit();
    return definition;
  }

  clearFruit(): void {
    this.fruitSprite?.destroy();
    this.fruitSprite = undefined;
    this.activeFruit = undefined;
  }

  private spawn(round: number): void {
    const definition = getFruitForRound(round);
    const tile = this.grid.getFruitSpawn();
    const world = this.grid.tileToWorld(tile);

    this.clearFruit();
    this.activeFruit = {
      definition,
      tile,
      remainingMs: FRUIT_LIFETIME_MS,
    };
    this.fruitSprite = this.scene.add.image(world.x, world.y, definition.spriteKey);
    this.fruitSprite.setScale(this.grid.tileSize / 16).setDepth(3);

    this.scene.tweens.add({
      targets: this.fruitSprite,
      scaleX: this.fruitSprite.scaleX * 1.08,
      scaleY: this.fruitSprite.scaleY * 1.08,
      duration: 360,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
