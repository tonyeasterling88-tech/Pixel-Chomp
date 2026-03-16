import type { Direction, EnemyDefinition, EnemyMode, GridPoint } from '../data/types';
import {
  chooseBestDirection,
  chooseTargetTile,
  type BehaviorContext,
} from './behaviors';

export class EnemyBrain {
  private mode: EnemyMode = 'spawn';

  constructor(private readonly definition: EnemyDefinition) {}

  setMode(mode: EnemyMode): void {
    this.mode = mode;
  }

  chooseTarget(context: BehaviorContext): GridPoint {
    return chooseTargetTile(this.definition, this.mode, context);
  }

  chooseDirection(
    options: Direction[],
    currentTile: GridPoint,
    context: BehaviorContext,
  ): Direction | null {
    if (this.mode === 'frightened') {
      if (options.length === 0) {
        return null;
      }

      return options[Math.floor(Math.random() * options.length)] ?? null;
    }

    return chooseBestDirection(options, currentTile, this.chooseTarget(context));
  }
}
