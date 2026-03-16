import Phaser from 'phaser';
import { gameConfig } from './game/config';
import './style.css';

declare global {
  interface Window {
    __PIXEL_CHOMP__?: Phaser.Game;
  }
}

const game = new Phaser.Game(gameConfig);

window.__PIXEL_CHOMP__ = game;
