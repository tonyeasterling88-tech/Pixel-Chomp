import Phaser from 'phaser';

interface FullscreenToggleOptions {
  x: number;
  y: number;
  compact?: boolean;
}

export const createFullscreenToggle = (
  scene: Phaser.Scene,
  { x, y, compact = false }: FullscreenToggleOptions,
): Phaser.GameObjects.Container => {
  const width = compact ? 132 : 164;
  const height = compact ? 30 : 34;
  const container = scene.add.container(x, y).setDepth(40);
  const background = scene.add
    .rectangle(0, 0, width, height, 0x101b2d, 0.82)
    .setStrokeStyle(2, 0x3ebfb5, 0.35)
    .setOrigin(0.5);
  const label = scene.add
    .text(0, 0, '', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: compact ? '14px' : '16px',
      color: '#f9f8ef',
    })
    .setOrigin(0.5);

  const updateLabel = () => {
    if (!scene.scale.fullscreen.available) {
      label.setText('FULLSCREEN N/A');
      background.setFillStyle(0x101b2d, 0.45);
      return;
    }

    label.setText(scene.scale.isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN');
    background.setFillStyle(scene.scale.isFullscreen ? 0x17344d : 0x101b2d, scene.scale.isFullscreen ? 0.92 : 0.82);
  };

  updateLabel();
  container.add([background, label]);

  if (scene.scale.fullscreen.available) {
    background.setInteractive({ useHandCursor: true });
    background.on('pointerup', () => {
      scene.scale.toggleFullscreen();
    });
  }

  scene.scale.on(Phaser.Scale.Events.ENTER_FULLSCREEN, updateLabel);
  scene.scale.on(Phaser.Scale.Events.LEAVE_FULLSCREEN, updateLabel);
  scene.scale.on(Phaser.Scale.Events.FULLSCREEN_UNSUPPORTED, updateLabel);
  scene.scale.on(Phaser.Scale.Events.FULLSCREEN_FAILED, updateLabel);

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.scale.off(Phaser.Scale.Events.ENTER_FULLSCREEN, updateLabel);
    scene.scale.off(Phaser.Scale.Events.LEAVE_FULLSCREEN, updateLabel);
    scene.scale.off(Phaser.Scale.Events.FULLSCREEN_UNSUPPORTED, updateLabel);
    scene.scale.off(Phaser.Scale.Events.FULLSCREEN_FAILED, updateLabel);
  });

  return container;
};
