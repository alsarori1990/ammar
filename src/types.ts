export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
  quantity: string;
  healthTip?: string;
  originalLanguage: string;
}

export interface UserSettings {
  dailyGoal: number;
  language: 'en' | 'ar';
}

export const STORAGE_KEYS = {
  ENTRIES: 'ammar_calories_entries',
  SETTINGS: 'ammar_calories_settings'
};

export function getEntries(): FoodEntry[] {
  const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
  return data ? JSON.parse(data) : [];
}

export function saveEntries(entries: FoodEntry[]) {
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
}

export function getSettings(): UserSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : { dailyGoal: 2000, language: 'en' };
}

export function saveSettings(settings: UserSettings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}
