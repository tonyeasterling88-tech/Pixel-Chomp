import Phaser from 'phaser';
import { AUDIO_PLAYBACK, type AudioKey } from '../data/audio';
import { SaveManager } from './SaveManager';

type MusicKey = Extract<AudioKey, `music${string}`>;
type SfxKey = Exclude<AudioKey, MusicKey>;

export class AudioManager {
  private currentSfx?: Phaser.Sound.BaseSound;
  private currentSfxPriority = -1;
  private currentMusic?: Phaser.Sound.BaseSound;
  private frightenedLoop?: Phaser.Sound.BaseSound;
  private lastPelletTime = 0;
  private readonly saveManager = new SaveManager();

  constructor(private readonly scene: Phaser.Scene) {
    this.scene.game.events.on(Phaser.Core.Events.HIDDEN, this.handleHidden, this);
    this.scene.game.events.on(Phaser.Core.Events.VISIBLE, this.handleVisible, this);

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scene.game.events.off(Phaser.Core.Events.HIDDEN, this.handleHidden, this);
      this.scene.game.events.off(Phaser.Core.Events.VISIBLE, this.handleVisible, this);
    });
  }

  private cleanupEffect(sound: Phaser.Sound.BaseSound): void {
    if (this.currentSfx === sound) {
      this.currentSfx = undefined;
      this.currentSfxPriority = -1;
    }

    sound.destroy();
  }

  playMusic(key: MusicKey, volume = 0.28): void {
    if (!this.saveManager.getSettings().musicEnabled) {
      return;
    }

    if (this.currentMusic?.key === key && this.currentMusic.isPlaying) {
      return;
    }

    this.stopMusic();
    this.currentMusic = this.scene.sound.add(key, { loop: true, volume });
    this.currentMusic.play();
  }

  playRoundStart(): void {
    this.playEffect('sfxStartJingle');
  }

  playVictory(): void {
    this.stopFrightenedLoop();
    this.playEffect('sfxVictoryJingle');
  }

  playDeath(): void {
    this.stopAll();
    this.playEffect('sfxDeath');
  }

  playPowerPellet(): void {
    this.playEffect('sfxPelletPickup');
  }

  playEnemyEaten(): void {
    this.playEffect('sfxFrightenedEnter');
  }

  playFruitCollect(): void {
    this.playEffect('sfxPelletPickup');
  }

  startFrightenedLoop(): void {
    if (!this.saveManager.getSettings().sfxEnabled) {
      return;
    }

    if (this.frightenedLoop?.isPlaying) {
      return;
    }

    const config = AUDIO_PLAYBACK.sfxFrightenedLoop;
    this.frightenedLoop = this.scene.sound.add('sfxFrightenedLoop');
    this.playConfiguredSound(this.frightenedLoop, 'sfxFrightenedLoop', config, true);
  }

  stopFrightenedLoop(): void {
    this.frightenedLoop?.stop();
    this.frightenedLoop?.destroy();
    this.frightenedLoop = undefined;
  }

  playPellet(now: number): void {
    if (now - this.lastPelletTime < 60) {
      return;
    }

    this.lastPelletTime = now;
    this.playEffect('sfxWakaWaka');
  }

  playEffect(key: SfxKey): void {
    if (!this.saveManager.getSettings().sfxEnabled) {
      return;
    }

    const config = AUDIO_PLAYBACK[key];
    const nextPriority = config?.priority ?? 0;

    if (this.currentSfx?.isPlaying && nextPriority < this.currentSfxPriority) {
      return;
    }

    this.currentSfx?.stop();
    this.currentSfx?.destroy();

    const sound = this.scene.sound.add(key);
    let cleanedUp = false;

    const finalize = () => {
      if (cleanedUp) {
        return;
      }

      cleanedUp = true;
      this.cleanupEffect(sound);
    };

    sound.once('complete', finalize);
    sound.once('stop', finalize);

    this.playConfiguredSound(sound, key, config);

    this.currentSfx = sound;
    this.currentSfxPriority = nextPriority;
  }

  stopMusic(): void {
    this.currentMusic?.stop();
    this.currentMusic?.destroy();
    this.currentMusic = undefined;
  }

  stopAll(): void {
    this.currentSfx?.stop();
    this.currentSfx?.destroy();
    this.currentSfx = undefined;
    this.currentSfxPriority = -1;
    this.stopFrightenedLoop();
    this.stopMusic();
  }

  private handleHidden(): void {
    this.scene.sound.pauseAll();
  }

  private handleVisible(): void {
    this.scene.sound.resumeAll();
  }

  private playConfiguredSound(
    sound: Phaser.Sound.BaseSound,
    key: string,
    config?: { duration?: number; loop?: boolean; volume?: number },
    defaultLoop = false,
  ): void {
    const loop = config?.loop ?? defaultLoop;
    const volume = config?.volume ?? 0.5;

    if (config?.duration) {
      sound.addMarker({
        name: `${key}-clip`,
        start: 0,
        duration: config.duration,
        config: {
          loop,
          volume,
        },
      });
      sound.play(`${key}-clip`);
      return;
    }

    sound.play({
      loop,
      volume,
    });
  }
}
