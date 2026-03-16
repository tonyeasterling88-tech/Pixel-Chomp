import Phaser from 'phaser';
import type { CollectibleState, GridPoint } from '../data/types';
import { gridPointToKey } from '../utils/grid';
import { GridManager } from './GridManager';

export interface CollectResult {
  points: number;
  power: boolean;
}

export class PelletSystem {
  private readonly initialState: CollectibleState[];
  private readonly collectibles = new Map<string, CollectibleState>();
  private readonly sprites = new Map<string, Phaser.GameObjects.Image>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly grid: GridManager,
  ) {
    this.initialState = grid.tiles
      .flat()
      .filter((tile) => tile.collectible)
      .map((tile) => ({
        tile: { x: tile.x, y: tile.y },
        type: tile.type as CollectibleState['type'],
        collected: false,
      }));
  }

  reset(): void {
    this.clearSprites();
    this.collectibles.clear();

    for (const pellet of this.initialState) {
      const key = gridPointToKey(pellet.tile);
      const copy = { ...pellet, tile: { ...pellet.tile } };
      this.collectibles.set(key, copy);

      const world = this.grid.tileToWorld(copy.tile);
      const sprite = this.scene.add.image(
        world.x,
        world.y,
        copy.type === 'power-pellet' ? 'power-pellet' : 'pellet',
      );
      sprite.setScale(this.grid.tileSize / 16);
      sprite.setDepth(2);
      if (copy.type === 'power-pellet') {
        this.scene.tweens.add({
          targets: sprite,
          alpha: 0.35,
          duration: 320,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
      }
      this.sprites.set(key, sprite);
    }
  }

  collectAt(tile: GridPoint): CollectResult | null {
    const key = gridPointToKey(tile);
    const collectible = this.collectibles.get(key);

    if (!collectible || collectible.collected) {
      return null;
    }

    collectible.collected = true;
    this.sprites.get(key)?.destroy();
    this.sprites.delete(key);

    return {
      points: collectible.type === 'power-pellet' ? 50 : 10,
      power: collectible.type === 'power-pellet',
    };
  }

  getRemainingCount(): number {
    return [...this.collectibles.values()].filter((collectible) => !collectible.collected).length;
  }

  private clearSprites(): void {
    this.sprites.forEach((sprite) => sprite.destroy());
    this.sprites.clear();
  }
}
