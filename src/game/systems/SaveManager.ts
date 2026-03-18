import type { LeaderboardEntry } from '../data/types';

export type ControlsMode = 'auto' | 'keyboard' | 'swipe';

export interface GameSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  controlsMode: ControlsMode;
}

export class SaveManager {
  private readonly highScoreKey = 'pixel-chomp:high-score';
  private readonly leaderboardKey = 'pixel-chomp:leaderboard';
  private readonly settingsKey = 'pixel-chomp:settings';
  private readonly lastInitialsKey = 'pixel-chomp:last-initials';
  private readonly leaderboardLimit = 10;

  getHighScore(): number {
    const leaderboardHigh = this.getLeaderboard()[0]?.score ?? 0;
    if (leaderboardHigh > 0) {
      return leaderboardHigh;
    }

    const stored = this.getStorage().getItem(this.highScoreKey);
    return stored ? Number.parseInt(stored, 10) || 0 : 0;
  }

  setHighScore(value: number): void {
    this.getStorage().setItem(this.highScoreKey, String(Math.max(0, Math.floor(value))));
  }

  getLeaderboard(): LeaderboardEntry[] {
    const storage = this.getStorage();
    const raw = storage.getItem(this.leaderboardKey);

    if (!raw) {
      return this.migrateLegacyHighScore();
    }

    try {
      const parsed = JSON.parse(raw) as LeaderboardEntry[];
      const sanitized = this.sortLeaderboard(
        parsed
          .filter((entry) => this.isValidLeaderboardEntry(entry))
          .map((entry) => ({
            initials: this.sanitizeInitials(entry.initials),
            score: Math.max(0, Math.floor(entry.score)),
            round: Math.max(1, Math.floor(entry.round)),
            achievedAt: Math.max(0, Math.floor(entry.achievedAt)),
          })),
      );

      storage.setItem(this.leaderboardKey, JSON.stringify(sanitized));
      return sanitized;
    } catch {
      return this.migrateLegacyHighScore();
    }
  }

  qualifiesForLeaderboard(score: number): boolean {
    const safeScore = Math.max(0, Math.floor(score));
    if (safeScore <= 0) {
      return false;
    }

    const leaderboard = this.getLeaderboard();
    if (leaderboard.length < this.leaderboardLimit) {
      return true;
    }

    return safeScore >= (leaderboard[this.leaderboardLimit - 1]?.score ?? Number.MAX_SAFE_INTEGER);
  }

  saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'achievedAt'> & { achievedAt?: number }): LeaderboardEntry[] {
    const nextEntry: LeaderboardEntry = {
      initials: this.sanitizeInitials(entry.initials),
      score: Math.max(0, Math.floor(entry.score)),
      round: Math.max(1, Math.floor(entry.round)),
      achievedAt: Math.max(0, Math.floor(entry.achievedAt ?? Date.now())),
    };
    const leaderboard = this.sortLeaderboard([...this.getLeaderboard(), nextEntry]);
    this.getStorage().setItem(this.leaderboardKey, JSON.stringify(leaderboard));
    this.setHighScore(leaderboard[0]?.score ?? 0);

    if (nextEntry.initials !== '---') {
      this.setLastInitials(nextEntry.initials);
    }

    return leaderboard;
  }

  getLastInitials(): string {
    const stored = this.getStorage().getItem(this.lastInitialsKey);
    return this.sanitizeInitials(stored ?? 'AAA');
  }

  setLastInitials(initials: string): void {
    this.getStorage().setItem(this.lastInitialsKey, this.sanitizeInitials(initials));
  }

  getSettings(): GameSettings {
    const defaults: GameSettings = {
      musicEnabled: true,
      sfxEnabled: true,
      controlsMode: 'auto',
    };

    const raw = this.getStorage().getItem(this.settingsKey);
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
    this.getStorage().setItem(this.settingsKey, JSON.stringify(settings));
  }

  private migrateLegacyHighScore(): LeaderboardEntry[] {
    const legacy = this.getStorage().getItem(this.highScoreKey);
    const legacyScore = legacy ? Number.parseInt(legacy, 10) || 0 : 0;
    const leaderboard =
      legacyScore > 0
        ? [
            {
              initials: '---',
              score: legacyScore,
              round: 1,
              achievedAt: 0,
            },
          ]
        : [];

    this.getStorage().setItem(this.leaderboardKey, JSON.stringify(leaderboard));
    return leaderboard;
  }

  private sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
    return [...entries]
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        return right.achievedAt - left.achievedAt;
      })
      .slice(0, this.leaderboardLimit);
  }

  private sanitizeInitials(initials: string): string {
    const letters = initials
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 3)
      .padEnd(3, 'A');

    return letters;
  }

  private isValidLeaderboardEntry(entry: unknown): entry is LeaderboardEntry {
    if (!entry || typeof entry !== 'object') {
      return false;
    }

    const candidate = entry as Partial<LeaderboardEntry>;
    return (
      typeof candidate.initials === 'string' &&
      typeof candidate.score === 'number' &&
      typeof candidate.round === 'number' &&
      typeof candidate.achievedAt === 'number'
    );
  }

  private getStorage(): Storage {
    return window.localStorage;
  }
}
