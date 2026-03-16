export type ControlsMode = 'auto' | 'keyboard' | 'swipe';

export interface GameSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  controlsMode: ControlsMode;
}

export class SaveManager {
  private readonly highScoreKey = 'pixel-chomp:high-score';
  private readonly settingsKey = 'pixel-chomp:settings';

  getHighScore(): number {
    const stored = window.localStorage.getItem(this.highScoreKey);
    return stored ? Number.parseInt(stored, 10) || 0 : 0;
  }

  setHighScore(value: number): void {
    window.localStorage.setItem(this.highScoreKey, String(value));
  }

  getSettings(): GameSettings {
    const defaults: GameSettings = {
      musicEnabled: true,
      sfxEnabled: true,
      controlsMode: 'auto',
    };

    const raw = window.localStorage.getItem(this.settingsKey);
    if (!raw) {
      return defaults;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<GameSettings>;
      return {
        musicEnabled: parsed.musicEnabled ?? defaults.musicEnabled,
        sfxEnabled: parsed.sfxEnabled ?? defaults.sfxEnabled,
        controlsMode: parsed.controlsMode ?? defaults.controlsMode,
      };
    } catch {
      return defaults;
    }
  }

  setSettings(settings: GameSettings): void {
    window.localStorage.setItem(this.settingsKey, JSON.stringify(settings));
  }
}
