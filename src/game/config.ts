import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameOverScene } from './scenes/GameOverScene';
import { GameScene } from './scenes/GameScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { PreloadScene } from './scenes/PreloadScene';
import { UIScene } from './scenes/UIScene';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 520;
export const TILE_SIZE = 24;
export const HUD_HEIGHT = 76;
export const PLAYFIELD_OFFSET_Y = 92;
export const GAME_CENTER_X = GAME_WIDTH / 2;
export const GAME_CENTER_Y = GAME_HEIGHT / 2;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#05080f',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true,
    expandParent: true,
  },
  scene: [BootScene, PreloadScene, MainMenuScene, GameScene, UIScene, GameOverScene],
};
