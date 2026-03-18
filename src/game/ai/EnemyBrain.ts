import type { Direction, EnemyDefinition, EnemyMode, GridPoint } from '../data/types';
import {
  chooseFrightenedDirection,
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
      return chooseFrightenedDirection(options, currentTile, context.frightenedHistory);
    }

    return chooseBestDirection(options, currentTile, this.chooseTarget(context));
  }
}
