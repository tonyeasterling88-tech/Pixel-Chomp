import Phaser from 'phaser';
import { GAME_CENTER_X, GAME_CENTER_Y, GAME_WIDTH } from '../config';
import { RIDDLES } from '../data/riddles';
import type { GameResumeData, LeaderboardEntry, RiddleDefinition } from '../data/types';
import { SaveManager } from '../systems/SaveManager';
import { createFullscreenToggle } from '../ui/FullscreenToggle';
import { createMenuCard } from '../ui/Menus';
import { createMenuKeys } from '../utils/input';
import { SceneKeys } from '../utils/SceneKeys';

type GameOverMode = 'continue-riddle' | 'summary' | 'enter-initials' | 'leaderboard';

interface GameOverData {
  mode?: GameOverMode;
  fromMenu?: boolean;
  score?: number;
  highScore?: number;
  round?: number;
  continuesUsed?: number;
  continueOffered?: boolean;
  continueData?: GameResumeData;
}

interface ActionButton {
  id: string;
  container: Phaser.GameObjects.Container;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class GameOverScene extends Phaser.Scene {
  private readonly saveManager = new SaveManager();
  private mode: GameOverMode = 'summary';
  private fromMenu = false;
  private score = 0;
  private highScore = 0;
  private round = 1;
  private continuesUsed = 0;
  private continueOffered = false;
  private continueData?: GameResumeData;
  private qualifiesForLeaderboard = false;
  private leaderboard: LeaderboardEntry[] = [];
  private currentRiddle?: RiddleDefinition;
  private selectedActionIndex = 0;
  private selectedInitialSlot = 0;
  private initials = ['A', 'A', 'A'];
  private readonly actionButtons: ActionButton[] = [];
  private readonly modeObjects: Phaser.GameObjects.GameObject[] = [];
  private titleText!: Phaser.GameObjects.Text;
  private detailText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;

  constructor() {
    super(SceneKeys.GameOver);
  }

  init(data: GameOverData): void {
    this.fromMenu = data.fromMenu ?? false;
    this.score = data.score ?? 0;
    this.highScore = data.highScore ?? Math.max(this.saveManager.getHighScore(), this.score);
    this.round = data.round ?? 1;
    this.continuesUsed = data.continuesUsed ?? 0;
    this.continueOffered = data.continueOffered ?? false;
    this.continueData = data.continueData;
    this.mode = data.mode ?? (this.continueOffered ? 'continue-riddle' : 'summary');
    this.qualifiesForLeaderboard = this.saveManager.qualifiesForLeaderboard(this.score);
    this.leaderboard = this.saveManager.getLeaderboard();
    this.initials = this.saveManager.getLastInitials().split('') as [string, string, string];
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#05080f');
    createMenuCard(this, GAME_CENTER_X, GAME_CENTER_Y, 620, 360);
    createFullscreenToggle(this, { x: GAME_WIDTH - 104, y: 30, compact: true });

    this.titleText = this.add
      .text(GAME_CENTER_X, 84, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '34px',
        color: '#ffd166',
      })
      .setOrigin(0.5);

    this.detailText = this.add
      .text(GAME_CENTER_X, 142, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '20px',
        color: '#f9f8ef',
        align: 'center',
        lineSpacing: 10,
        wordWrap: { width: 520 },
      })
      .setOrigin(0.5, 0);

    this.hintText = this.add
      .text(GAME_CENTER_X, 472, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '16px',
        color: '#8fb9d5',
        align: 'center',
      })
      .setOrigin(0.5);

    const keys = createMenuKeys(this.input);
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input is required for Pixel Chomp.');
    }

    const up = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const down = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const left = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const right = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    const w = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const s = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const a = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const d = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    const moveUp = () => this.handleVerticalMove(-1);
    const moveDown = () => this.handleVerticalMove(1);
    const moveLeft = () => this.handleHorizontalMove(-1);
    const moveRight = () => this.handleHorizontalMove(1);

    up.on('down', moveUp);
    w.on('down', moveUp);
    down.on('down', moveDown);
    s.on('down', moveDown);
    left.on('down', moveLeft);
    a.on('down', moveLeft);
    right.on('down', moveRight);
    d.on('down', moveRight);
    keys.confirm.on('down', () => this.confirmSelection());
    keys.cancel.on('down', () => this.cancelSelection());

    this.renderMode();
  }

  private renderMode(): void {
    this.clearMode();
    this.leaderboard = this.saveManager.getLeaderboard();
    this.highScore = Math.max(this.highScore, this.leaderboard[0]?.score ?? 0);
    this.selectedActionIndex = 0;

    switch (this.mode) {
      case 'continue-riddle':
        this.renderContinueRiddle();
        break;
      case 'enter-initials':
        this.renderInitialsEntry();
        break;
      case 'leaderboard':
        this.renderLeaderboard();
        break;
      case 'summary':
      default:
        this.renderSummary();
        break;
    }
  }

  private renderContinueRiddle(): void {
    this.titleText.setText('CONTINUE?');
    this.currentRiddle = this.pickRiddle();
    this.detailText.setText(
      `Answer correctly to keep the run alive.\nContinues used ${this.continuesUsed}/3\n\n${this.currentRiddle.prompt}`,
    );

    const startY = 310;
    this.createActionButton('choice-0', this.currentRiddle.choices[0], startY);
    this.createActionButton('choice-1', this.currentRiddle.choices[1], startY + 46);
    this.createActionButton('choice-2', this.currentRiddle.choices[2], startY + 92);
    this.createActionButton('skip', 'END RUN', startY + 150, false);
    this.updateActionSelection();
    this.hintText.setText('Up / Down to pick  |  Enter to answer  |  Esc to end run');
  }

  private renderSummary(): void {
    this.titleText.setText(this.fromMenu ? 'LEADERBOARD' : 'GAME OVER');
    this.detailText.setText(
      this.fromMenu
        ? 'This device keeps the top 10 local arcade scores.'
        : `Score ${this.score.toString().padStart(6, '0')}\nHigh ${this.highScore
            .toString()
            .padStart(6, '0')}\nRound ${this.round}\nContinues ${this.continuesUsed}/3`,
    );

    if (this.fromMenu) {
      this.mode = 'leaderboard';
      this.renderMode();
      return;
    }

    this.createActionButton('next', this.qualifiesForLeaderboard ? 'ENTER INITIALS' : 'VIEW LEADERBOARD', 320);
    this.createActionButton('menu', 'MAIN MENU', 372, false);
    this.updateActionSelection();
    this.hintText.setText('Up / Down to pick  |  Enter to continue');
  }

  private renderInitialsEntry(): void {
    this.titleText.setText('NEW HIGH SCORE');
    this.detailText.setText(
      `Score ${this.score.toString().padStart(6, '0')} qualified for the top 10.\nSet your initials.`,
    );

    const centerY = 282;
    const startX = GAME_CENTER_X - 120;

    this.initials.forEach((letter, index) => {
      const x = startX + index * 120;
      const selected = index === this.selectedInitialSlot;

      const frame = this.add
        .rectangle(x, centerY, 78, 102, selected ? 0x17344d : 0x101b2d, selected ? 0.9 : 0.74)
        .setStrokeStyle(2, 0x3ebfb5, selected ? 0.52 : 0.24);
      const text = this.add
        .text(x, centerY, letter, {
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '54px',
          color: '#f9f8ef',
        })
        .setOrigin(0.5);
      const upButton = this.createMiniButton(`up-${index}`, 'UP', x, centerY - 74, () => this.shiftInitial(index, 1));
      const downButton = this.createMiniButton(`down-${index}`, 'DN', x, centerY + 74, () => this.shiftInitial(index, -1));

      this.modeObjects.push(frame, text, upButton.container, downButton.container);
    });

    this.createActionButton('save', 'SAVE SCORE', 404);
    this.createActionButton('back', 'BACK', 452, false);
    this.updateInitialSelection();
    this.updateActionSelection(true);
    this.hintText.setText('Left / Right choose letter  |  Up / Down change letter  |  Enter saves');
  }

  private renderLeaderboard(): void {
    this.titleText.setText('LEADERBOARD');
    this.detailText.setText('');

    if (this.leaderboard.length === 0) {
      const empty = this.add
        .text(GAME_CENTER_X, 228, 'No scores yet.\nStart a run and claim the top spot.', {
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '22px',
          color: '#f9f8ef',
          align: 'center',
          lineSpacing: 10,
        })
        .setOrigin(0.5);
      this.modeObjects.push(empty);
    } else {
      this.leaderboard.slice(0, 10).forEach((entry, index) => {
        const row = this.add
          .text(
            GAME_CENTER_X,
            186 + index * 22,
            `${String(index + 1).padStart(2, '0')}  ${entry.initials}   ${entry.score
              .toString()
              .padStart(6, '0')}   R${entry.round}`,
            {
              fontFamily: 'Trebuchet MS, monospace',
              fontSize: '19px',
              color: index === 0 ? '#ffd166' : '#f9f8ef',
            },
          )
          .setOrigin(0.5);
        this.modeObjects.push(row);
      });
    }

    if (this.fromMenu) {
      this.createActionButton('menu', 'MAIN MENU', 438);
    } else {
      this.createActionButton('play', 'PLAY AGAIN', 416);
      this.createActionButton('menu', 'MAIN MENU', 462, false);
    }

    this.updateActionSelection();
    this.hintText.setText('Up / Down to pick  |  Enter to confirm');
  }

  private createActionButton(id: string, label: string, y: number, primary = true): void {
    const width = primary ? 320 : 250;
    const container = this.add.container(GAME_CENTER_X, y);
    const background = this.add
      .rectangle(0, 0, width, 36, primary ? 0x17344d : 0x101b2d, primary ? 0.78 : 0.66)
      .setStrokeStyle(2, 0x3ebfb5, primary ? 0.42 : 0.22);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '22px',
        color: '#f9f8ef',
      })
      .setOrigin(0.5);

    background.setInteractive({ useHandCursor: true });
    background.on('pointerover', () => {
      const index = this.actionButtons.findIndex((button) => button.id === id);
      if (index >= 0) {
        this.selectedActionIndex = index;
        this.updateActionSelection();
      }
    });
    background.on('pointerup', () => this.handleAction(id));

    container.add([background, text]);
    this.actionButtons.push({ id, container });
  }

  private createMiniButton(
    id: string,
    label: string,
    x: number,
    y: number,
    onPress: () => void,
  ): ActionButton {
    const container = this.add.container(x, y);
    const background = this.add
      .rectangle(0, 0, 52, 28, 0x101b2d, 0.78)
      .setStrokeStyle(2, 0x3ebfb5, 0.22);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '18px',
        color: '#f9f8ef',
      })
      .setOrigin(0.5);

    background.setInteractive({ useHandCursor: true });
    background.on('pointerup', onPress);
    container.add([background, text]);
    void id;
    return { id, container };
  }

  private clearMode(): void {
    this.actionButtons.splice(0).forEach((button) => button.container.destroy(true));
    this.modeObjects.splice(0).forEach((object) => object.destroy());
  }

  private updateActionSelection(forcePrimary = false): void {
    this.actionButtons.forEach((button, index) => {
      const background = button.container.list[0] as Phaser.GameObjects.Rectangle | undefined;
      const text = button.container.list[1] as Phaser.GameObjects.Text | undefined;
      const selected = index === this.selectedActionIndex;

      if (!background || !text) {
        return;
      }

      background.setFillStyle(selected ? 0x17344d : 0x101b2d, selected ? 0.94 : forcePrimary ? 0.7 : 0.66);
      background.setStrokeStyle(2, 0x3ebfb5, selected ? 0.52 : 0.22);
      text.setColor(selected ? '#ffd166' : '#f9f8ef');
    });
  }

  private updateInitialSelection(): void {
    const frames = this.modeObjects
      .filter((object) => object instanceof Phaser.GameObjects.Rectangle)
      .slice(0, 3) as Phaser.GameObjects.Rectangle[];

    frames.forEach((frame, index) => {
      const selected = index === this.selectedInitialSlot;
      frame.setFillStyle(selected ? 0x17344d : 0x101b2d, selected ? 0.9 : 0.74);
      frame.setStrokeStyle(2, 0x3ebfb5, selected ? 0.52 : 0.24);
    });
  }

  private handleVerticalMove(delta: number): void {
    if (this.mode === 'enter-initials') {
      this.shiftInitial(this.selectedInitialSlot, -delta);
      return;
    }

    if (this.actionButtons.length === 0) {
      return;
    }

    this.selectedActionIndex = Phaser.Math.Wrap(this.selectedActionIndex + delta, 0, this.actionButtons.length);
    this.updateActionSelection();
  }

  private handleHorizontalMove(delta: number): void {
    if (this.mode !== 'enter-initials') {
      return;
    }

    this.selectedInitialSlot = Phaser.Math.Wrap(this.selectedInitialSlot + delta, 0, this.initials.length);
    this.updateInitialSelection();
  }

  private confirmSelection(): void {
    if (this.mode === 'enter-initials') {
      this.handleAction('save');
      return;
    }

    const action = this.actionButtons[this.selectedActionIndex];
    if (action) {
      this.handleAction(action.id);
    }
  }

  private cancelSelection(): void {
    if (this.mode === 'continue-riddle' || this.mode === 'enter-initials') {
      this.mode = 'summary';
      this.renderMode();
      return;
    }

    this.scene.start(SceneKeys.MainMenu);
  }

  private handleAction(id: string): void {
    switch (id) {
      case 'choice-0':
      case 'choice-1':
      case 'choice-2': {
        const selectedIndex = Number.parseInt(id.split('-')[1] ?? '-1', 10);
        const correct = selectedIndex === this.currentRiddle?.correctIndex;
        if (correct && this.continueData && this.currentRiddle) {
          this.scene.launch(SceneKeys.UI);
          this.scene.start(SceneKeys.Game, {
            resumeData: {
              ...this.continueData,
              usedRiddleIds: [...this.continueData.usedRiddleIds, this.currentRiddle.id],
            },
          });
          return;
        }

        this.mode = 'summary';
        this.renderMode();
        return;
      }
      case 'skip':
        this.mode = 'summary';
        this.renderMode();
        return;
      case 'next':
        this.mode = this.qualifiesForLeaderboard ? 'enter-initials' : 'leaderboard';
        this.renderMode();
        return;
      case 'save':
        this.leaderboard = this.saveManager.saveLeaderboardEntry({
          initials: this.initials.join(''),
          score: this.score,
          round: this.round,
        });
        this.mode = 'leaderboard';
        this.renderMode();
        return;
      case 'back':
        this.mode = 'summary';
        this.renderMode();
        return;
      case 'play':
        this.scene.launch(SceneKeys.UI);
        this.scene.start(SceneKeys.Game);
        return;
      case 'menu':
      default:
        this.scene.start(SceneKeys.MainMenu);
        return;
    }
  }

  private shiftInitial(index: number, delta: number): void {
    const current = ALPHABET.indexOf(this.initials[index] ?? 'A');
    const next = Phaser.Math.Wrap(current + delta, 0, ALPHABET.length);
    this.initials[index] = ALPHABET[next] ?? 'A';
    this.renderMode();
  }

  private pickRiddle(): RiddleDefinition {
    const used = new Set(this.continueData?.usedRiddleIds ?? []);
    const available = RIDDLES.filter((riddle) => !used.has(riddle.id));
    return Phaser.Utils.Array.GetRandom(available.length > 0 ? available : RIDDLES);
  }
}
