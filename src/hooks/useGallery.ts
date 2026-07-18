/**
 * useGallery – Custom React hook to manage Picsum image fetching,
 * infinite scroll pagination, duplicate-safe pull-to-refresh logic.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PicsumImage } from '../types/picsum';

const PAGE_SIZE = 20;

export function useGalleryHook() {
  const [images, setImages] = useState<PicsumImage[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchingRef = useRef<boolean>(false);

  const fetchImages = useCallback(
    async (pageNum: number, reset: boolean = false): Promise<void> => {
      if (fetchingRef.current) {
        return;
      }
      fetchingRef.current = true;

      try {
        const response = await fetch(
          `https://picsum.photos/v2/list?page=${pageNum}&limit=${PAGE_SIZE}`,
        );
        const data: PicsumImage[] = await response.json();

        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }

        setImages(prev => {
          if (reset) {
            return data;
          }
          const existingIds = new Set(prev.map(img => img.id));
          const newItems = data.filter(img => !existingIds.has(img.id));
          return [...prev, ...newItems];
        });
      } catch (err) {
        console.error('Picsum API fetch error:', err);
      } finally {
        fetchingRef.current = false;
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await fetchImages(1, true);
      setIsLoading(false);
    })();
  }, [fetchImages]);

  const handleLoadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || isLoadingMore || fetchingRef.current) {
      return;
    }
    setIsLoadingMore(true);
    const nextPage = page + 1;
    await fetchImages(nextPage);
    setPage(nextPage);
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore, page, fetchImages]);

  const handleRefresh = useCallback(async (): Promise<void> => {
    if (isRefreshing || fetchingRef.current) {
      return;
    }
    setIsRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchImages(1, true);
    setIsRefreshing(false);
  }, [isRefreshing, fetchImages]);

  return {
    images,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    handleLoadMore,
    handleRefresh,
  };
}
