/**
 * GalleryContext – centralized state for image favoriting.
 *
 * Persists the set of favorited image IDs in AsyncStorage (@favorites).
 * Provides `toggleFavorite`, `isFavorite`, and the full `favorites` map
 * keyed by image ID → PicsumImage for rendering the Favorites tab.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PicsumImage } from '../types/picsum';

// ---------------------------------------------------------------------------
// Storage key
// ---------------------------------------------------------------------------

const FAVORITES_KEY = '@favorites';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Map of image id → full PicsumImage object. */
type FavoritesMap = Record<string, PicsumImage>;

interface GalleryContextValue {
  /** Full map of all favorited images. */
  favorites: FavoritesMap;
  /** Check whether a specific image is favorited. */
  isFavorite: (imageId: string) => boolean;
  /** Toggle an image in/out of favorites. */
  toggleFavorite: (image: PicsumImage) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const GalleryContext = createContext<GalleryContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface GalleryProviderProps {
  children: React.ReactNode;
}

export function GalleryProvider({
  children,
}: GalleryProviderProps): React.JSX.Element {
  const [favorites, setFavorites] = useState<FavoritesMap>({});

  // Hydrate from AsyncStorage on mount.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(FAVORITES_KEY);
        if (raw) {
          setFavorites(JSON.parse(raw) as FavoritesMap);
        }
      } catch {
        // Silently ignore corrupt data.
      }
    })();
  }, []);

  // Persist whenever favorites change.
  const persist = useCallback(async (next: FavoritesMap) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch {
      // Best-effort persistence.
    }
  }, []);

  const isFavorite = useCallback(
    (imageId: string): boolean => imageId in favorites,
    [favorites],
  );

  const toggleFavorite = useCallback(
    (image: PicsumImage): void => {
      setFavorites(prev => {
        const next = { ...prev };
        if (image.id in next) {
          delete next[image.id];
        } else {
          next[image.id] = image;
        }
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const value = useMemo<GalleryContextValue>(
    () => ({ favorites, isFavorite, toggleFavorite }),
    [favorites, isFavorite, toggleFavorite],
  );

  return (
    <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the gallery favorites state.
 * Must be called inside a `<GalleryProvider>`.
 */
export function useGallery(): GalleryContextValue {
  const ctx = useContext(GalleryContext);
  if (ctx === undefined) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return ctx;
}
