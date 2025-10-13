import type { PerfectRunRecord, QuizSettings, QuizMode } from '@/types';

// localStorage keys
const STORAGE_KEYS = {
  BEST_PRACTICE_TIME: 'az104-best-practice-time',
  BEST_PRACTICE_SCORE: 'az104-best-practice-score',
  BEST_EXAM_TIME: 'az104-best-exam-time',
  BEST_EXAM_SCORE: 'az104-best-exam-score',
  QUIZ_SETTINGS: 'az104-quiz-settings'
} as const;

/**
 * Default quiz settings
 */
const DEFAULT_SETTINGS: QuizSettings = {
  penaltyType: 'score'
};

/**
 * Safe localStorage operations with error handling
 * Returns null if localStorage is not available or operation fails
 */
class StorageManager {
  private isAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private getItem(key: string): string | null {
    if (!this.isAvailable()) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private setItem(key: string, value: string): boolean {
    if (!this.isAvailable()) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get quiz settings from localStorage
   */
  getSettings(): QuizSettings {
    const stored = this.getItem(STORAGE_KEYS.QUIZ_SETTINGS);
    if (!stored) return DEFAULT_SETTINGS;
    
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save quiz settings to localStorage
   */
  saveSettings(settings: QuizSettings): boolean {
    return this.setItem(STORAGE_KEYS.QUIZ_SETTINGS, JSON.stringify(settings));
  }

  /**
   * Get best record for a specific mode
   */
  getBestRecord(mode: QuizMode): PerfectRunRecord | null {
    const timeKey = mode === 'practice' ? STORAGE_KEYS.BEST_PRACTICE_TIME : STORAGE_KEYS.BEST_EXAM_TIME;
    const scoreKey = mode === 'practice' ? STORAGE_KEYS.BEST_PRACTICE_SCORE : STORAGE_KEYS.BEST_EXAM_SCORE;
    
    const timeData = this.getItem(timeKey);
    const scoreData = this.getItem(scoreKey);
    
    if (!timeData && !scoreData) return null;
    
    try {
      const timeRecord = timeData ? JSON.parse(timeData) : null;
      const scoreRecord = scoreData ? JSON.parse(scoreData) : null;
      
      // Return the record with better time, or score if no time record exists
      if (timeRecord && scoreRecord) {
        return timeRecord.time <= scoreRecord.time ? timeRecord : scoreRecord;
      }
      
      return timeRecord || scoreRecord;
    } catch {
      return null;
    }
  }

  /**
   * Save a new perfect run record if it's better than existing
   */
  savePerfectRun(score: number, time: number, mode: QuizMode): boolean {
    const record: PerfectRunRecord = {
      score,
      time,
      date: new Date().toISOString(),
      mode
    };

    const timeKey = mode === 'practice' ? STORAGE_KEYS.BEST_PRACTICE_TIME : STORAGE_KEYS.BEST_EXAM_TIME;
    const scoreKey = mode === 'practice' ? STORAGE_KEYS.BEST_PRACTICE_SCORE : STORAGE_KEYS.BEST_EXAM_SCORE;

    let saved = false;

    // Check if this is a new best time
    const currentBestTime = this.getBestRecord(mode);
    if (!currentBestTime || time < currentBestTime.time) {
      saved = this.setItem(timeKey, JSON.stringify(record)) || saved;
    }

    // Check if this is a new best score
    if (!currentBestTime || score > currentBestTime.score) {
      saved = this.setItem(scoreKey, JSON.stringify(record)) || saved;
    }

    return saved;
  }

  /**
   * Clear all stored data (for testing or reset purposes)
   */
  clearAll(): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const storage = new StorageManager();

// Export individual functions for convenience
export const getSettings = () => storage.getSettings();
export const saveSettings = (settings: QuizSettings) => storage.saveSettings(settings);
export const getBestRecord = (mode: QuizMode) => storage.getBestRecord(mode);
export const savePerfectRun = (score: number, time: number, mode: QuizMode) => 
  storage.savePerfectRun(score, time, mode);
export const clearAllData = () => storage.clearAll();
