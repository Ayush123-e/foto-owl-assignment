/**
 * storage.ts – Optimized AsyncStorage custom getters and setters.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  /**
   * Retrieve parsed JSON data from AsyncStorage.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      console.error(`AsyncStorage.get error for key ${key}:`, err);
      return null;
    }
  },

  /**
   * Save stringified JSON data to AsyncStorage.
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`AsyncStorage.set error for key ${key}:`, err);
    }
  },

  /**
   * Remove a key from AsyncStorage.
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.error(`AsyncStorage.remove error for key ${key}:`, err);
    }
  },

  /**
   * Clear all storage values.
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (err) {
      console.error('AsyncStorage.clear error:', err);
    }
  },
};
