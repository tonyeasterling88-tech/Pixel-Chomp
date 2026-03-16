import Phaser from 'phaser';
import { ENEMY_DEFINITIONS } from '../data/enemies';
import { maze01 } from '../data/mazes/maze01';
import { POWER_MODE } from '../data/powerups';
import { SCORE_VALUES } from '../data/scoring';
import type { Direction, EnemyMode, GridPoint } from '../data/types';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { AudioManager } from '../systems/AudioManager';
import { FXManager } from '../systems/FXManager';
import { FruitSystem } from '../systems/FruitSystem';
import { GridManager } from '../systems/GridManager';
import { GridMovementSystem } from '../systems/GridMovementSystem';
import { PelletSystem } from '../systems/PelletSystem';
import { RoundManager } from '../systems/RoundManager';
import { SaveManager, type ControlsMode } from '../systems/SaveManager';
import { ScoreManager } from '../systems/ScoreManager';
import { MobileControls } from '../ui/MobileControls';
import { GameEvents } from '../utils/GameEvents';
import { gameEvents } from '../utils/events';
import { createGameplayKeys, getRequestedDirection, type GameplayKeys } from '../utils/input';
import { SceneKeys } from '../utils/SceneKeys';
import { sameGridPoint } from '../utils/grid';

export class GameScene extends Phaser.Scene {
  private gridManager!: GridManager;
  private pelletSystem!: PelletSystem;
  private fruitSystem!: FruitSystem;
  private movementSystem!: GridMovementSystem;
  private player!: Player;
  private enemies: Enemy[] = [];
  private scoreManager!: ScoreManager;
  private roundManager!: RoundManager;
  private audioManager!: AudioManager;
  private fxManager!: FXManager;
  private keys!: GameplayKeys;
  private readonly saveManager = new SaveManager();
  private controlsMode: ControlsMode = 'auto';
  private mobileControls?: MobileControls;
  private pelletsEatenThisRound = 0;
  private roundElapsedMs = 0;
  private transitionTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super(SceneKeys.Game);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#05080f');

    this.gridManager = new GridManager(this, maze01);
    this.gridManager.render();

    this.pelletSystem = new PelletSystem(this, this.gridManager);
    this.fruitSystem = new FruitSystem(this, this.gridManager);
    this.movementSystem = new GridMovementSystem();
    this.scoreManager = new ScoreManager(this.saveManager);
    this.roundManager = new RoundManager();
    this.audioManager = new AudioManager(this);
    this.fxManager = new FXManager(this);
    this.keys = createGameplayKeys(this.input);
    this.controlsMode = this.saveManager.getSettings().controlsMode;
    if (this.shouldUseSwipeControls()) {
      this.mobileControls = new MobileControls(this, () => this.togglePause());
    }

    const playerSpawn = this.gridManager.getPlayerSpawn();
    const playerWorld = this.gridManager.tileToWorld(playerSpawn);
    this.player = new Player(this, playerWorld.x, playerWorld.y, playerSpawn, this.gridManager.tileSize / 16);

    this.enemies = ENEMY_DEFINITIONS.map((definition) => {
      const world = this.gridManager.tileToWorld(definition.houseTile);
      return new Enemy(
        this,
        world.x,
        world.y,
        definition,
        definition.houseTile,
        this.gridManager.tileSize / 16,
      );
    });

    this.keys.pause.on('down', () => this.togglePause());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.transitionTimer?.remove(false);
      this.mobileControls?.destroy();
      this.audioManager.stopAll();
    });

    this.time.delayedCall(0, () => {
      this.audioManager.playMusic('musicMazeChase');
      this.scoreManager.resetGame();
      this.roundManager.startNewGame(this.gridManager.getInitialPelletCount());
      this.prepareRound();
    });
  }

  update(_time: number, delta: number): void {
    let snapshot = this.roundManager.getSnapshot();

    if (snapshot.state !== 'playing') {
      return;
    }

    this.roundElapsedMs += delta;

    const requestedDirection =
      this.shouldUseSwipeControls()
        ? this.mobileControls?.getRequestedDirection() ?? null
        : getRequestedDirection(this.keys) ?? null;
    this.player.speed = this.roundManager.getCurrentConfig().playerSpeed;
    this.movementSystem.movePlayer(this.player, this.gridManager, delta / 1000, requestedDirection);

    this.resolvePelletCollection();
    snapshot = this.roundManager.getSnapshot();
    this.fruitSystem.update(delta, snapshot.pelletsRemaining, snapshot.round);
    this.resolveFruitCollection();

    const tick = this.roundManager.tick(delta);
    if (tick.frightenedExpired) {
      this.endPowerMode();
    }

    if (tick.modeChanged) {
      this.handleGlobalModeSwitch();
    }

    this.updateEnemies(delta / 1000);
    this.checkPlayerEnemyCollisions();

    if (this.scoreManager.consumeExtraLifeFlag()) {
      this.roundManager.addLife();
      this.fxManager.flashMessage('Extra life');
    }
  }

  private prepareRound(): void {
    this.transitionTimer?.remove(false);
    this.pelletSystem.reset();
    this.fruitSystem.reset(this.roundManager.getSnapshot().round, this.gridManager.getInitialPelletCount());
    this.pelletsEatenThisRound = 0;
    this.roundElapsedMs = 0;
    this.mobileControls?.clearRequestedDirection();

    const config = this.roundManager.getCurrentConfig();
    const playerWorld = this.gridManager.tileToWorld(this.player.spawnTile);
    this.player.resetTo(this.player.spawnTile, playerWorld);
    this.player.speed = config.playerSpeed;

    for (const enemy of this.enemies) {
      const world = this.gridManager.tileToWorld(enemy.spawnTile);
      enemy.resetTo(enemy.spawnTile, world);
      enemy.speed = 0;
    }

    this.roundManager.clearPowerMode();
    this.audioManager.stopFrightenedLoop();
    this.audioManager.playMusic('musicMazeChase');
    this.gridManager.setGhostDoorOpen(false);

    this.transitionTimer = this.time.delayedCall(config.introDelayMs, () => {
      this.roundManager.setPlaying();
      this.audioManager.playRoundStart();
    });
  }

  private resolvePelletCollection(): void {
    const collected = this.pelletSystem.collectAt(this.player.currentTile);

    if (!collected) {
      return;
    }

    this.pelletsEatenThisRound += 1;
    this.scoreManager.awardPellet(collected.power);
    this.roundManager.consumePellet();
    this.fxManager.pulse(this.player);

    if (collected.power) {
      this.audioManager.playPowerPellet();
      this.activatePowerMode();
      this.fxManager.flashScreen(0x7ee8fa, 0.18, POWER_MODE.screenFlashDurationMs);
    } else {
      this.audioManager.playPellet(this.time.now);
    }

    if (this.roundManager.getSnapshot().pelletsRemaining === 0) {
      this.handleRoundClear();
    }
  }

  private resolveFruitCollection(): void {
    const fruit = this.fruitSystem.collectAt(this.player.currentTile);

    if (!fruit) {
      return;
    }

    this.scoreManager.awardFruit(fruit.points);
    this.audioManager.playFruitCollect();
    this.fxManager.popupScore(this.player.x, this.player.y - 22, `${fruit.points}`, '#ffd166');
    this.fxManager.flashMessage(`${fruit.id.toUpperCase()} +${fruit.points}`);
  }

  private activatePowerMode(): void {
    const config = this.roundManager.getCurrentConfig();
    this.roundManager.triggerPowerMode(config.frightenedDurationMs, config.frightenedFlashMs);
    this.scoreManager.resetEnemyCombo();
    this.audioManager.startFrightenedLoop();

    for (const enemy of this.enemies) {
      if (enemy.mode === 'scatter' || enemy.mode === 'chase') {
        enemy.setMode('frightened');
        enemy.reverseDirection();
      }
    }
  }

  private endPowerMode(): void {
    this.audioManager.stopFrightenedLoop();
    this.scoreManager.resetEnemyCombo();

    for (const enemy of this.enemies) {
      if (enemy.mode === 'frightened') {
        enemy.setMode(this.roundManager.getSnapshot().globalMode);
        enemy.reverseDirection();
      }
    }
  }

  private handleGlobalModeSwitch(): void {
    const globalMode = this.roundManager.getSnapshot().globalMode;

    for (const enemy of this.enemies) {
      if (enemy.mode === 'scatter' || enemy.mode === 'chase') {
        enemy.setMode(globalMode);
        enemy.reverseDirection();
      }
    }
  }

  private updateEnemies(deltaSeconds: number): void {
    const snapshot = this.roundManager.getSnapshot();
    const config = this.roundManager.getCurrentConfig();
    const doorTile = this.gridManager.getGhostDoor();
    const glint = this.enemies.find((enemy) => enemy.definition.id === 'glint');
    const glintTile = glint?.currentTile ?? this.player.currentTile;
    let doorOpen = false;

    for (const enemy of this.enemies) {
      if (!enemy.released && this.shouldReleaseEnemy(enemy)) {
        enemy.released = true;
        enemy.isLeavingHouse = true;
        enemy.isReturningHome = false;
        enemy.setMode('spawn');
        enemy.setDirection('up');
        enemy.bufferedDirection = 'up';
      }

      if (!enemy.released) {
        enemy.speed = 0;
        continue;
      }

      if (enemy.mode === 'spawn' && sameGridPoint(enemy.currentTile, doorTile)) {
        enemy.isLeavingHouse = false;
        enemy.setMode(snapshot.frightenedActive ? 'frightened' : snapshot.globalMode);
      }

      if (enemy.mode === 'returning' && sameGridPoint(enemy.currentTile, enemy.spawnTile)) {
        enemy.isReturningHome = false;
        enemy.isLeavingHouse = true;
        enemy.setMode('spawn');
        enemy.setDirection('up');
        enemy.bufferedDirection = 'up';
      }

      if (enemy.mode === 'spawn') {
        doorOpen = doorOpen || enemy.isLeavingHouse;
        enemy.speed = config.enemySpeed * 0.92;
        this.movementSystem.moveEnemy(
          enemy,
          this.gridManager,
          deltaSeconds,
          this.getEnemyTraversalState(enemy),
          this.getSpawnDirection(enemy, doorTile),
        );
        continue;
      }

      doorOpen = doorOpen || enemy.isReturningHome;
      enemy.setFlashing(snapshot.frightenedFlashing && enemy.mode === 'frightened');
      enemy.speed = this.getEnemySpeed(enemy.mode, enemy.currentTile);

      let chosenDirection = enemy.direction;
      if (
        this.gridManager.isNearTileCenter(enemy, 5) &&
        this.gridManager.needsDecision(
          enemy.currentTile,
          'enemy',
          enemy.direction,
          this.getEnemyTraversalState(enemy),
        )
      ) {
        const legalDirections = this.gridManager.getLegalDirections(
          enemy.currentTile,
          'enemy',
          enemy.direction,
          this.getEnemyTraversalState(enemy),
          enemy.mode === 'returning',
        );

        chosenDirection = enemy.brain.chooseDirection(legalDirections, enemy.currentTile, {
          selfTile: enemy.currentTile,
          spawnDoorTile: doorTile,
          playerTile: this.player.currentTile,
          playerDirection: this.player.direction,
          glintTile,
        });
      }

      this.movementSystem.moveEnemy(
        enemy,
        this.gridManager,
        deltaSeconds,
        this.getEnemyTraversalState(enemy),
        chosenDirection ?? enemy.direction,
      );
    }

    this.gridManager.setGhostDoorOpen(doorOpen);
  }

  private shouldReleaseEnemy(enemy: Enemy): boolean {
    return this.roundElapsedMs >= enemy.definition.release.delayMs;
  }

  private getEnemySpeed(mode: EnemyMode, tile: GridPoint): number {
    const config = this.roundManager.getCurrentConfig();

    if (mode === 'returning') {
      return config.returningSpeed;
    }

    const tileType = this.gridManager.getTile(tile)?.type;
    const baseSpeed = mode === 'frightened' ? config.frightenedSpeed : config.enemySpeed;
    return tileType === 'tunnel' ? baseSpeed * config.tunnelSpeedMultiplier : baseSpeed;
  }

  private getSpawnDirection(enemy: Enemy, doorTile: GridPoint): Direction {
    const legalDirections = this.gridManager.getLegalDirections(
      enemy.currentTile,
      'enemy',
      enemy.direction,
      this.getEnemyTraversalState(enemy),
      true,
    );

    if (legalDirections.length === 0) {
      return enemy.direction ?? 'up';
    }

    if (sameGridPoint(enemy.currentTile, doorTile)) {
      return legalDirections.includes('up') ? 'up' : legalDirections[0];
    }

    return legalDirections.reduce((bestDirection, direction) => {
      const nextTile = this.gridManager.getAdjacentTile(enemy.currentTile, direction);
      const bestTile = this.gridManager.getAdjacentTile(enemy.currentTile, bestDirection);
      const nextDistance = Phaser.Math.Distance.Between(nextTile.x, nextTile.y, doorTile.x, doorTile.y);
      const bestDistance = Phaser.Math.Distance.Between(bestTile.x, bestTile.y, doorTile.x, doorTile.y);
      return nextDistance < bestDistance ? direction : bestDirection;
    }, legalDirections[0]);
  }

  private getEnemyTraversalState(enemy: Enemy): { mode: EnemyMode; isLeavingHouse: boolean; isReturningHome: boolean } {
    return {
      mode: enemy.mode,
      isLeavingHouse: enemy.isLeavingHouse,
      isReturningHome: enemy.isReturningHome,
    };
  }

  private checkPlayerEnemyCollisions(): void {
    const threshold = this.gridManager.tileSize * 0.52;

    for (const enemy of this.enemies) {
      if (!enemy.visible) {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance > threshold) {
        continue;
      }

      if (enemy.mode === 'frightened') {
        this.handleEnemyEaten(enemy);
        continue;
      }

      if (enemy.mode === 'scatter' || enemy.mode === 'chase' || enemy.mode === 'spawn') {
        this.handlePlayerHit();
        return;
      }
    }
  }

  private handleEnemyEaten(enemy: Enemy): void {
    const points = this.scoreManager.awardEnemyCombo();
    enemy.setMode('returning');
    enemy.reverseDirection();
    this.audioManager.playEnemyEaten();
    this.fxManager.popupScore(enemy.x, enemy.y - 16, `${points}`, '#b7f4ff');
  }

  private handlePlayerHit(): void {
    if (this.roundManager.getSnapshot().state !== 'playing') {
      return;
    }

    this.player.setPlayerState('dying');
    this.audioManager.playDeath();
    this.audioManager.stopFrightenedLoop();
    this.fruitSystem.clearFruit();
    this.roundManager.clearPowerMode();
    this.fxManager.nudgeCamera(0.004, 200);
    this.fxManager.flashScreen(0xff6b6b, 0.16, 220);

    const isGameOver = this.roundManager.loseLife();
    this.transitionTimer?.remove(false);

    if (isGameOver) {
      this.transitionTimer = this.time.delayedCall(1300, () => {
        this.scene.stop(SceneKeys.UI);
        this.scene.start(SceneKeys.GameOver, {
          ...this.scoreManager.getSnapshot(),
          round: this.roundManager.getSnapshot().round,
        });
      });
      return;
    }

    this.transitionTimer = this.time.delayedCall(this.roundManager.getCurrentConfig().respawnDelayMs, () => {
      this.player.setPlayerState('respawning');
      this.prepareRespawn();
    });
  }

  private prepareRespawn(): void {
    const playerWorld = this.gridManager.tileToWorld(this.player.spawnTile);
    this.player.resetTo(this.player.spawnTile, playerWorld);

    for (const enemy of this.enemies) {
      const world = this.gridManager.tileToWorld(enemy.spawnTile);
      enemy.resetTo(enemy.spawnTile, world);
    }

    this.roundElapsedMs = 0;
    this.pelletsEatenThisRound = Math.max(0, this.gridManager.getInitialPelletCount() - this.pelletSystem.getRemainingCount());
    this.mobileControls?.clearRequestedDirection();

    this.transitionTimer = this.time.delayedCall(700, () => {
      this.roundManager.setPlaying();
    });
  }

  private handleRoundClear(): void {
    this.roundManager.setRoundClear();
    this.audioManager.playVictory();
    this.audioManager.stopFrightenedLoop();
    this.fruitSystem.clearFruit();
    this.fxManager.flashScreen(0xffd166, 0.18, 200);
    this.fxManager.flashMessage('Round clear');
    this.scoreManager.add(SCORE_VALUES.roundClear);

    this.transitionTimer?.remove(false);
    this.transitionTimer = this.time.delayedCall(1400, () => {
      this.roundManager.advanceRound(this.gridManager.getInitialPelletCount());
      this.prepareRound();
    });
  }

  private togglePause(): void {
    const state = this.roundManager.getSnapshot().state;

    if (state === 'intro' || state === 'respawning' || state === 'round-clear' || state === 'game-over') {
      return;
    }

    this.roundManager.setPaused(state !== 'paused');
  }

  private shouldUseSwipeControls(): boolean {
    if (this.controlsMode === 'swipe') {
      return true;
    }

    if (this.controlsMode === 'keyboard') {
      return false;
    }

    return (
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)
    );
  }
}
