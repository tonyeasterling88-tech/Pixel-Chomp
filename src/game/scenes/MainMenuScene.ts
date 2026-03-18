import Phaser from 'phaser';
import { GAME_CENTER_X, GAME_CENTER_Y, GAME_HEIGHT, GAME_WIDTH } from '../config';
import { AudioManager } from '../systems/AudioManager';
import { SaveManager, type ControlsMode, type GameSettings } from '../systems/SaveManager';
import { createFullscreenToggle } from '../ui/FullscreenToggle';
import { createMenuCard } from '../ui/Menus';
import { createMenuKeys } from '../utils/input';
import { SceneKeys } from '../utils/SceneKeys';

type MenuMode = 'main' | 'options';

interface MenuEntry {
  id: string;
  label: string;
  description: string;
}

export class MainMenuScene extends Phaser.Scene {
  private readonly saveManager = new SaveManager();
  private settings!: GameSettings;
  private audioManager!: AudioManager;
  private readonly useTouchUi =
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window);
  private mode: MenuMode = 'main';
  private mainIndex = 0;
  private optionIndex = 0;
  private readonly mainEntries: MenuEntry[] = [
    {
      id: 'start',
      label: 'START GAME',
      description: 'Drop straight into the maze and start chomping pellets.',
    },
    {
      id: 'options',
      label: 'OPTIONS',
      description: 'Toggle music and sound effects for this device.',
    },
    {
      id: 'howto',
      label: 'HOW TO PLAY',
      description: 'Swipe or use the d-pad. Power pellets flip the chase.',
    },
    {
      id: 'leaderboard',
      label: 'LEADERBOARD',
      description: 'View the local top-10 arcade scores for this device.',
    },
    {
      id: 'credits',
      label: 'CREDITS',
      description: 'Pixel Chomp: original arcade-inspired maze-chase project.',
    },
  ];
  private menuButtons: Phaser.GameObjects.Container[] = [];
  private detailText!: Phaser.GameObjects.Text;
  private footerText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private card!: Phaser.GameObjects.Container;

  constructor() {
    super(SceneKeys.MainMenu);
  }

  create(): void {
    this.settings = this.saveManager.getSettings();
    this.audioManager = new AudioManager(this);
    this.cameras.main.setBackgroundColor('#09111d');

    this.add.rectangle(GAME_CENTER_X, GAME_CENTER_Y, GAME_WIDTH, GAME_HEIGHT, 0x09111d, 1);
    this.add.rectangle(GAME_CENTER_X, 88, 620, 170, 0x1a2b48, 0.22).setAngle(-4);
    this.add.rectangle(GAME_CENTER_X + 140, GAME_HEIGHT - 62, 280, 120, 0x16304a, 0.18).setAngle(7);
    createFullscreenToggle(this, { x: GAME_WIDTH - 104, y: 30, compact: true });

    this.card = createMenuCard(this, GAME_CENTER_X, GAME_CENTER_Y + 16, 580, 324);

    this.add
      .image(GAME_CENTER_X, 132, 'pixel-chomp-logo')
      .setScale(0.5)
      .setTintFill(0xffffff)
      .setAlpha(0.96);

    this.highScoreText = this.add
      .text(GAME_CENTER_X, 206, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '18px',
        color: '#8fb9d5',
      })
      .setOrigin(0.5);

    this.detailText = this.add
      .text(GAME_CENTER_X, 410, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '17px',
        color: '#dce8f2',
        align: 'center',
        lineSpacing: 7,
        wordWrap: { width: 430 },
      })
      .setOrigin(0.5);

    this.footerText = this.add
      .text(GAME_CENTER_X, 466, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '16px',
        color: '#ffd166',
        align: 'center',
      })
      .setOrigin(0.5);

    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input is required for Pixel Chomp.');
    }

    const keys = createMenuKeys(this.input);
    const up = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    const down = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    const w = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const s = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    up.on('down', () => this.moveSelection(-1));
    w.on('down', () => this.moveSelection(-1));
    down.on('down', () => this.moveSelection(1));
    s.on('down', () => this.moveSelection(1));
    keys.confirm.on('down', () => this.activateSelection());
    keys.cancel.on('down', () => {
      if (this.mode === 'options') {
        this.mode = 'main';
        this.renderMenu();
      }
    });

    this.renderMenu();
  }

  private renderMenu(): void {
    this.menuButtons.forEach((button) => button.destroy(true));
    this.menuButtons = [];

    this.highScoreText.setText(
      `HIGH SCORE ${this.saveManager.getHighScore().toString().padStart(6, '0')}`,
    );

    const entries = this.getEntries();
    const selectedIndex = this.getSelectedIndex();
    const startY = 248;
    const spacing = 40;

    entries.forEach((entry, index) => {
      const selected = index === selectedIndex;
      const y = startY + index * spacing;
      const button = this.add.container(GAME_CENTER_X, y);
      const hit = this.add.rectangle(0, 0, 360, 34, selected ? 0x17344d : 0x101b2d, selected ? 0.55 : 0.26);
      let pressStart: { x: number; y: number } | null = null;
      hit.setStrokeStyle(2, 0x3ebfb5, selected ? 0.42 : 0.16);
      const text = this.add
        .text(0, 0, this.decorateEntry(entry.label, selected), {
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: selected ? '24px' : '22px',
          color: selected ? '#ffd166' : '#f9f8ef',
          align: 'center',
        })
        .setOrigin(0.5);

      hit.setInteractive({ useHandCursor: true });
      if (!this.useTouchUi) {
        hit.on('pointerover', () => {
          this.setSelectedIndex(index);
          this.renderMenu();
        });
      }
      hit.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        pressStart = { x: pointer.x, y: pointer.y };
      });
      hit.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        if (!pressStart) {
          return;
        }

        const moved = Phaser.Math.Distance.Between(pressStart.x, pressStart.y, pointer.x, pointer.y);
        pressStart = null;
        this.setSelectedIndex(index);
        this.renderMenu();

        if (moved <= 18) {
          this.activateSelection();
        }
      });
      hit.on('pointerout', () => {
        pressStart = null;
      });
      hit.on('pointerupoutside', () => {
        pressStart = null;
      });

      button.add([hit, text]);
      this.menuButtons.push(button);
    });

    const selectedEntry = entries[selectedIndex] ?? entries[0];
    this.detailText.setText(selectedEntry?.description ?? '');
    this.highScoreText.setDepth(4);
    this.detailText.setDepth(4);
    this.footerText.setDepth(4);
    this.footerText.setText(
      this.mode === 'options'
        ? 'Enter to toggle  |  Esc to go back'
        : this.useTouchUi
          ? 'Tap a menu item to choose it'
          : 'Arrow keys / swipe to choose  |  Enter or tap to confirm',
    );
  }

  private getEntries(): MenuEntry[] {
    if (this.mode === 'options') {
      return [
        {
          id: 'controls',
          label: `CONTROLS ${this.formatControlsMode(this.settings.controlsMode)}`,
          description: 'Auto picks the device. Keyboard and Swipe force a specific input style.',
        },
        {
          id: 'music',
          label: `MUSIC ${this.settings.musicEnabled ? 'ON' : 'OFF'}`,
          description: 'Background tracks during gameplay and menus.',
        },
        {
          id: 'sfx',
          label: `SFX ${this.settings.sfxEnabled ? 'ON' : 'OFF'}`,
          description: 'Pellet, frightened, victory, and collision sounds.',
        },
        {
          id: 'back',
          label: 'BACK',
          description: 'Return to the main arcade menu.',
        },
      ];
    }

    return this.mainEntries;
  }

  private getSelectedIndex(): number {
    return this.mode === 'options' ? this.optionIndex : this.mainIndex;
  }

  private setSelectedIndex(index: number): void {
    if (this.mode === 'options') {
      this.optionIndex = index;
      return;
    }

    this.mainIndex = index;
  }

  private moveSelection(delta: number): void {
    const entries = this.getEntries();
    const current = this.getSelectedIndex();
    const next = Phaser.Math.Wrap(current + delta, 0, entries.length);
    this.setSelectedIndex(next);
    this.audioManager.playEffect('sfxQuickBlip');
    this.renderMenu();
  }

  private activateSelection(): void {
    const entries = this.getEntries();
    const selected = entries[this.getSelectedIndex()];

    if (!selected) {
      return;
    }

    this.audioManager.playEffect('sfxStartJingle');

    if (this.mode === 'options') {
      if (selected.id === 'controls') {
        this.settings = {
          ...this.settings,
          controlsMode: this.getNextControlsMode(this.settings.controlsMode),
        };
        this.saveManager.setSettings(this.settings);
      } else if (selected.id === 'music') {
        this.settings = { ...this.settings, musicEnabled: !this.settings.musicEnabled };
        this.saveManager.setSettings(this.settings);
      } else if (selected.id === 'sfx') {
        this.settings = { ...this.settings, sfxEnabled: !this.settings.sfxEnabled };
        this.saveManager.setSettings(this.settings);
      } else {
        this.mode = 'main';
      }

      this.renderMenu();
      return;
    }

    switch (selected.id) {
      case 'start':
        this.startGame();
        break;
      case 'options':
        this.mode = 'options';
        this.optionIndex = 0;
        this.renderMenu();
        break;
      case 'howto':
        this.detailText.setText(
          'Swipe the screen to queue turns.\nCollect every pellet, dodge enemies, and chase frightened foes for combo points.',
        );
        this.footerText.setText('Pick another item to keep exploring the menu.');
        break;
      case 'leaderboard':
        this.scene.start(SceneKeys.GameOver, { mode: 'leaderboard', fromMenu: true });
        break;
      case 'credits':
        this.detailText.setText(
          'Built in Phaser 3 + TypeScript.\nPixel Chomp is an original maze-chase game scaffold with custom enemies and modular systems.',
        );
        this.footerText.setText('Pick another item to keep exploring the menu.');
        break;
      default:
        break;
    }
  }

  private decorateEntry(label: string, selected: boolean): string {
    return selected ? `> ${label} <` : label;
  }

  private formatControlsMode(mode: ControlsMode): string {
    return mode.toUpperCase();
  }

  private getNextControlsMode(mode: ControlsMode): ControlsMode {
    switch (mode) {
      case 'auto':
        return 'keyboard';
      case 'keyboard':
        return 'swipe';
      case 'swipe':
      default:
        return 'auto';
    }
  }

  private startGame(): void {
    if (!this.scene.isActive(SceneKeys.UI)) {
      this.scene.launch(SceneKeys.UI);
    }
    this.scene.start(SceneKeys.Game);
  }
}
