import Phaser from 'phaser';
import { GAME_WIDTH, PLAYFIELD_OFFSET_Y } from '../config';
import type { Direction, EnemyMode, GridPoint, MazeDefinition, MazeTile, TileType } from '../data/types';
import {
  DIRECTION_PRIORITY,
  DIRECTION_VECTORS,
  OPPOSITE_DIRECTION,
  addGridPoints,
  gridPointToKey,
} from '../utils/grid';

const resolveTileType = (symbol: string): TileType => {
  switch (symbol) {
    case '#':
      return 'wall';
    case '.':
      return 'pellet';
    case 'o':
      return 'power-pellet';
    case 'P':
      return 'player-spawn';
    case 'G':
      return 'enemy-spawn';
    case 'D':
      return 'ghost-door';
    case 'F':
      return 'fruit-spawn';
    case 'T':
      return 'tunnel';
    default:
      return 'floor';
  }
};

type OccupantKind = 'player' | 'enemy';
export type EnemyTraversalState =
  | EnemyMode
  | {
      mode: EnemyMode;
      isLeavingHouse?: boolean;
      isReturningHome?: boolean;
    };

export class GridManager {
  readonly tiles: MazeTile[][];
  readonly width: number;
  readonly height: number;
  readonly tileSize: number;
  readonly boardLeft: number;
  readonly boardTop: number;
  private ghostDoorVisual?: Phaser.GameObjects.Rectangle;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly maze: MazeDefinition,
  ) {
    this.tileSize = maze.tileSize;
    this.height = maze.layout.length;
    this.width = maze.layout[0]?.length ?? 0;
    this.boardLeft = Math.round((GAME_WIDTH - this.width * this.tileSize) / 2);
    this.boardTop = PLAYFIELD_OFFSET_Y;
    this.tiles = maze.layout.map((row, y) => this.parseRow(row, y));
    this.validate();
  }

  render(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, 0);
    const background = this.scene.add.rectangle(
      this.boardLeft + (this.width * this.tileSize) / 2,
      this.boardTop + (this.height * this.tileSize) / 2,
      this.width * this.tileSize + 22,
      this.height * this.tileSize + 20,
      0x09111d,
      0.98,
    );
    background.setStrokeStyle(2, 0x3ebfb5, 0.35);

    const innerFrame = this.scene.add.rectangle(
      this.boardLeft + (this.width * this.tileSize) / 2,
      this.boardTop + (this.height * this.tileSize) / 2,
      this.width * this.tileSize + 8,
      this.height * this.tileSize + 10,
      0x07101a,
      0.96,
    );
    innerFrame.setStrokeStyle(1, 0xffffff, 0.06);

    container.add([background, innerFrame]);

    for (const row of this.tiles) {
      for (const tile of row) {
        const world = this.tileToWorld(tile);

        if (tile.type === 'wall') {
          const wall = this.scene.add.image(world.x, world.y, 'maze-tile');
          wall.setScale(this.tileSize / 16);
          wall.setTint(0x69dbff);
          wall.setAlpha(0.92);
          container.add(wall);
        }

        if (tile.type === 'ghost-door') {
          const door = this.scene.add.rectangle(world.x, world.y, this.tileSize - 4, 6, 0xff7f7f, 0.95);
          this.ghostDoorVisual = door;
          container.add(door);
        }
      }
    }

    return container;
  }

  getBoardBottom(): number {
    return this.boardTop + this.height * this.tileSize;
  }

  getPlayerSpawn(): GridPoint {
    return this.findFirst('player-spawn') ?? { x: 10, y: 12 };
  }

  getGhostDoor(): GridPoint {
    return this.findFirst('ghost-door') ?? { x: 10, y: 6 };
  }

  getFruitSpawn(): GridPoint {
    return this.findFirst('fruit-spawn') ?? { x: 10, y: 10 };
  }

  getEnemyHouseTiles(): GridPoint[] {
    return this.findAll('enemy-spawn');
  }

  getEnemySpawn(tile: GridPoint): GridPoint {
    return this.findFirst('enemy-spawn') ?? tile;
  }

  getTile(point: GridPoint): MazeTile | undefined {
    if (point.y < 0 || point.y >= this.height || point.x < 0 || point.x >= this.width) {
      return undefined;
    }

    return this.tiles[point.y]?.[point.x];
  }

  tileToWorld(tile: GridPoint): GridPoint {
    return {
      x: this.boardLeft + tile.x * this.tileSize + this.tileSize / 2,
      y: this.boardTop + tile.y * this.tileSize + this.tileSize / 2,
    };
  }

  worldToTile(point: GridPoint): GridPoint {
    return {
      x: Math.floor((point.x - this.boardLeft) / this.tileSize),
      y: Math.floor((point.y - this.boardTop) / this.tileSize),
    };
  }

  isNearTileCenter(point: GridPoint, threshold = 4): boolean {
    const tile = this.worldToTile(point);
    const center = this.tileToWorld(tile);
    return Math.abs(point.x - center.x) <= threshold && Math.abs(point.y - center.y) <= threshold;
  }

  snapToTileCenter(point: GridPoint, tile: GridPoint): GridPoint {
    return this.tileToWorld(tile);
  }

  canOccupy(point: GridPoint, occupant: OccupantKind, mode?: EnemyMode): boolean {
    return this.canOccupyWithState(point, occupant, mode);
  }

  canOccupyWithState(point: GridPoint, occupant: OccupantKind, state?: EnemyTraversalState): boolean {
    const tile = this.getTile(point);

    if (!tile) {
      return false;
    }

    if (tile.type === 'wall') {
      return false;
    }

    if (occupant === 'player') {
      return tile.type !== 'enemy-spawn' && tile.type !== 'ghost-door';
    }

    const enemyMode = this.resolveEnemyMode(state);

    if (tile.type === 'enemy-spawn') {
      return enemyMode === 'spawn' || enemyMode === 'returning';
    }

    if (tile.type === 'ghost-door') {
      return this.canEnemyUseDoor(state);
    }

    return true;
  }

  getAdjacentTile(point: GridPoint, direction: Direction): GridPoint {
    const next = addGridPoints(point, DIRECTION_VECTORS[direction]);
    const currentTile = this.getTile(point);

    if (
      currentTile?.type === 'tunnel' &&
      direction === 'left' &&
      next.x < 0
    ) {
      return { x: this.width - 1, y: point.y };
    }

    if (
      currentTile?.type === 'tunnel' &&
      direction === 'right' &&
      next.x >= this.width
    ) {
      return { x: 0, y: point.y };
    }

    return next;
  }

  getLegalDirections(
    point: GridPoint,
    occupant: OccupantKind,
    currentDirection: Direction | null,
    mode?: EnemyTraversalState,
    allowReverse = true,
  ): Direction[] {
    return DIRECTION_PRIORITY.filter((direction) => {
      if (!allowReverse && currentDirection && OPPOSITE_DIRECTION[currentDirection] === direction) {
        return false;
      }

      return this.canOccupyWithState(this.getAdjacentTile(point, direction), occupant, mode);
    });
  }

  needsDecision(
    point: GridPoint,
    occupant: OccupantKind,
    currentDirection: Direction | null,
    mode?: EnemyTraversalState,
  ): boolean {
    if (!currentDirection) {
      return true;
    }

    const legal = this.getLegalDirections(point, occupant, currentDirection, mode, false);
    const forward = this.getAdjacentTile(point, currentDirection);

    if (!this.canOccupyWithState(forward, occupant, mode)) {
      return true;
    }

    return legal.some((direction) => direction !== currentDirection);
  }

  applyWrap(point: GridPoint): GridPoint {
    const tileY = Math.floor((point.y - this.boardTop) / this.tileSize);
    const leftTunnel = this.getTile({ x: 0, y: tileY });
    const rightTunnel = this.getTile({ x: this.width - 1, y: tileY });
    const leftBound = this.boardLeft;
    const rightBound = this.boardLeft + this.width * this.tileSize;

    if (point.x < leftBound && leftTunnel?.type === 'tunnel') {
      return {
        x: this.boardLeft + (this.width - 0.5) * this.tileSize,
        y: point.y,
      };
    }

    if (point.x > rightBound && rightTunnel?.type === 'tunnel') {
      return {
        x: this.boardLeft + this.tileSize / 2,
        y: point.y,
      };
    }

    return point;
  }

  getInitialPelletCount(): number {
    return this.tiles.flat().filter((tile) => tile.collectible).length;
  }

  setGhostDoorOpen(open: boolean): void {
    if (!this.ghostDoorVisual) {
      return;
    }

    this.ghostDoorVisual.setFillStyle(open ? 0xffd166 : 0xff7f7f, open ? 0.38 : 0.95);
    this.ghostDoorVisual.setScale(1, open ? 0.45 : 1);
  }

  createTileKey(point: GridPoint): string {
    return gridPointToKey(point);
  }

  private parseRow(row: string, y: number): MazeTile[] {
    return row.split('').map((symbol, x) => {
      const type = resolveTileType(symbol);
      const walkable = type !== 'wall';
      const collectible = type === 'pellet' || type === 'power-pellet';

      return {
        x,
        y,
        symbol,
        type,
        walkable,
        collectible,
      };
    });
  }

  private validate(): void {
    for (const row of this.maze.layout) {
      if (row.length !== this.width) {
        throw new Error(`Maze ${this.maze.key} has inconsistent row widths.`);
      }
    }

    const playerSpawn = this.findFirst('player-spawn');
    if (!playerSpawn) {
      throw new Error(`Maze ${this.maze.key} is missing a player spawn.`);
    }

    if (!this.findFirst('ghost-door')) {
      throw new Error(`Maze ${this.maze.key} is missing a ghost door.`);
    }

    this.validateConnectivity(playerSpawn);
  }

  private findFirst(type: TileType): GridPoint | undefined {
    return this.tiles.flat().find((tile) => tile.type === type);
  }

  private findAll(type: TileType): GridPoint[] {
    return this.tiles.flat().filter((tile) => tile.type === type);
  }

  private resolveEnemyMode(state?: EnemyTraversalState): EnemyMode | undefined {
    if (!state) {
      return undefined;
    }

    return typeof state === 'string' ? state : state.mode;
  }

  private canEnemyUseDoor(state?: EnemyTraversalState): boolean {
    if (!state) {
      return false;
    }

    if (typeof state === 'string') {
      return state === 'spawn' || state === 'returning';
    }

    return Boolean(state.isLeavingHouse || state.isReturningHome);
  }

  private validateConnectivity(playerSpawn: GridPoint): void {
    const queue: GridPoint[] = [{ ...playerSpawn }];
    const visited = new Set<string>([this.createTileKey(playerSpawn)]);

    while (queue.length > 0) {
      const tile = queue.shift();
      if (!tile) {
        continue;
      }

      for (const direction of DIRECTION_PRIORITY) {
        const next = this.getAdjacentTile(tile, direction);
        const key = this.createTileKey(next);

        if (visited.has(key) || !this.canOccupy(next, 'player')) {
          continue;
        }

        visited.add(key);
        queue.push(next);
      }
    }

    const unreachable = this.tiles
      .flat()
      .filter((tile) => tile.walkable && tile.type !== 'enemy-spawn' && tile.type !== 'ghost-door')
      .filter((tile) => !visited.has(this.createTileKey(tile)));

    if (unreachable.length > 0) {
      const sample = unreachable
        .slice(0, 4)
        .map((tile) => `(${tile.x},${tile.y})`)
        .join(', ');
      throw new Error(`Maze ${this.maze.key} has unreachable player tiles: ${sample}`);
    }
  }
}
