/**
 * GalleryContext – centralized state for image favoriting using storage wrapper.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { storage } from '../utils/storage';
import type { PicsumImage } from '../types/picsum';

// ---------------------------------------------------------------------------
// Storage key
// ---------------------------------------------------------------------------

const FAVORITES_KEY = '@favorites';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FavoritesMap = Record<string, PicsumImage>;

interface GalleryContextValue {
  favorites: FavoritesMap;
  isFavorite: (imageId: string) => boolean;
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

  // Hydrate from storage on mount.
  useEffect(() => {
    (async () => {
      try {
        const data = await storage.get<FavoritesMap>(FAVORITES_KEY);
        if (data) {
          setFavorites(data);
        }
      } catch {
        // Silently ignore corrupt data.
      }
    })();
  }, []);

  const persist = useCallback(async (next: FavoritesMap) => {
    try {
      await storage.set(FAVORITES_KEY, next);
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

export function useGallery(): GalleryContextValue {
  const ctx = useContext(GalleryContext);
  if (ctx === undefined) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return ctx;
}
