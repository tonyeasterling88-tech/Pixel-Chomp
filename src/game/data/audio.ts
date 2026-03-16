export const AUDIO_ASSETS = {
  musicLetsGo: 'assets/audio/music/lets-go.mp3',
  musicMazeChase: 'assets/audio/music/maze-chase.mp3',
  musicRetroChase: 'assets/audio/music/retro-chase.mp3',
  musicThisIsIt: 'assets/audio/music/this-is-it.mp3',
  sfxDeath: 'assets/audio/sfx/death.mp3',
  sfxFrightenedEnter: 'assets/audio/sfx/frightened-enter.mp3',
  sfxFrightenedLoop: 'assets/audio/sfx/frightened-loop.mp3',
  sfxPelletPickup: 'assets/audio/sfx/pellet-pickup.mp3',
  sfxQuickBlip: 'assets/audio/sfx/quick-blip.mp3',
  sfxStartJingle: 'assets/audio/sfx/start-jingle.mp3',
  sfxVictoryJingle: 'assets/audio/sfx/victory-jingle.mp3',
  sfxWakaWaka: 'assets/audio/sfx/waka-waka.mp3',
} as const;

export type AudioKey = keyof typeof AUDIO_ASSETS;

export interface AudioPlaybackConfig {
  duration?: number;
  loop?: boolean;
  priority?: number;
  volume?: number;
}

export const AUDIO_PLAYBACK: Partial<Record<AudioKey, AudioPlaybackConfig>> = {
  sfxPelletPickup: { duration: 0.4, priority: 2, volume: 0.45 },
  sfxQuickBlip: { duration: 0.07, priority: 0, volume: 0.38 },
  sfxWakaWaka: { duration: 0.07, priority: 0, volume: 0.42 },
  sfxFrightenedLoop: { duration: 0.8, loop: true, priority: 1, volume: 0.16 },
  sfxFrightenedEnter: { duration: 0.3, priority: 2, volume: 0.48 },
  sfxVictoryJingle: { duration: 1.0, priority: 2, volume: 0.44 },
  sfxStartJingle: { duration: 1.2, priority: 3, volume: 0.42 },
  sfxDeath: { duration: 1.0, priority: 3, volume: 0.5 },
};
