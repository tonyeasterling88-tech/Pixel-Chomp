import Phaser from 'phaser';
import type { Direction } from '../data/types';

export interface MenuKeys {
  confirm: Phaser.Input.Keyboard.Key;
  cancel: Phaser.Input.Keyboard.Key;
  pause: Phaser.Input.Keyboard.Key;
}

export interface GameplayKeys extends MenuKeys {
  up: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  w: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
}

const getKeyboard = (input: Phaser.Input.InputPlugin): Phaser.Input.Keyboard.KeyboardPlugin => {
  const keyboard = input.keyboard;

  if (!keyboard) {
    throw new Error('Keyboard input is required for Pixel Chomp.');
  }

  return keyboard;
};

export const createMenuKeys = (input: Phaser.Input.InputPlugin): MenuKeys => {
  const keyboard = getKeyboard(input);
  return {
    confirm: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
    cancel: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    pause: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
  };
};

export const createGameplayKeys = (input: Phaser.Input.InputPlugin): GameplayKeys => {
  const keyboard = getKeyboard(input);

  return {
    ...createMenuKeys(input),
    up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
    left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
    down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
    right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    w: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    a: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    s: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    d: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
  };
};

export const getRequestedDirection = (keys: GameplayKeys): Direction | null => {
  if (keys.up.isDown || keys.w.isDown) {
    return 'up';
  }

  if (keys.left.isDown || keys.a.isDown) {
    return 'left';
  }

  if (keys.down.isDown || keys.s.isDown) {
    return 'down';
  }

  if (keys.right.isDown || keys.d.isDown) {
    return 'right';
  }

  return null;
};
