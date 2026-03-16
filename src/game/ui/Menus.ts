import Phaser from 'phaser';

export const createMenuCard = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
): Phaser.GameObjects.Container => {
  const card = scene.add.container(x, y);
  const background = scene.add.rectangle(0, 0, width, height, 0x101b2d, 0.92);
  background.setStrokeStyle(2, 0x3ebfb5, 0.35);
  const frame = scene.add.rectangle(0, 0, width - 18, height - 18, 0x0d1523, 0.94);
  frame.setStrokeStyle(1, 0xf9f8ef, 0.12);
  card.add([background, frame]);
  return card;
};
