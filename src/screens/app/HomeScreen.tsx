/**
 * HomeScreen – Picsum image gallery with infinite scroll,
 * debounced search, composite author filter, and local favoriting.
 *
 * API: https://picsum.photos/v2/list?page={page}&limit=20
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useGallery } from '../../context/GalleryContext';
import { useDebounce } from '../../hooks/useDebounce';
import type { PicsumImage } from '../../types/picsum';
import type { HomeScreenProps } from '../../navigation/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 220;

type AuthorFilter = 'all' | 'a-m' | 'n-z';

const FILTER_OPTIONS: { key: AuthorFilter; label: string }[] = [
  { key: 'all', label: 'All Images' },
  { key: 'a-m', label: 'Author A–M' },
  { key: 'n-z', label: 'Author N–Z' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HomeScreen({
  navigation,
}: HomeScreenProps): React.JSX.Element {
  // -- Data state -----------------------------------------------------------
  const [images, setImages] = useState<PicsumImage[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Guard against duplicate fetches.
  const fetchingRef = useRef<boolean>(false);

  // -- Search & Filter state ------------------------------------------------
  const [searchText, setSearchText] = useState<string>('');
  const debouncedSearch = useDebounce(searchText, 300);
  const [activeFilter, setActiveFilter] = useState<AuthorFilter>('all');

  // -- Gallery context (favorites) ------------------------------------------
  const { isFavorite, toggleFavorite } = useGallery();

  // -- Fetch images ---------------------------------------------------------
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
          // Deduplicate by id.
          const existingIds = new Set(prev.map(img => img.id));
          const newItems = data.filter(img => !existingIds.has(img.id));
          return [...prev, ...newItems];
        });
      } catch {
        // Silently handle network errors.
      } finally {
        fetchingRef.current = false;
      }
    },
    [],
  );

  // Initial load.
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await fetchImages(1, true);
      setIsLoading(false);
    })();
  }, [fetchImages]);

  // -- Infinite scroll (onEndReached) ---------------------------------------
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

  // -- Pull-to-refresh (duplicate-safe) -------------------------------------
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

  // -- Memoised filtered + searched data ------------------------------------
  const filteredImages = useMemo<PicsumImage[]>(() => {
    let result = images;

    // 1) Author filter.
    if (activeFilter === 'a-m') {
      result = result.filter(img => {
        const first = img.author.charAt(0).toUpperCase();
        return first >= 'A' && first <= 'M';
      });
    } else if (activeFilter === 'n-z') {
      result = result.filter(img => {
        const first = img.author.charAt(0).toUpperCase();
        return first >= 'N' && first <= 'Z';
      });
    }

    // 2) Search (case-insensitive author name).
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.trim().toLowerCase();
      result = result.filter(img =>
        img.author.toLowerCase().includes(query),
      );
    }

    return result;
  }, [images, activeFilter, debouncedSearch]);

  // -- Render helpers -------------------------------------------------------

  const renderItem = useCallback(
    ({ item }: { item: PicsumImage }): React.JSX.Element => {
      const thumbnailUrl = `https://picsum.photos/id/${item.id}/${Math.round(
        SCREEN_WIDTH,
      )}/220`;
      const favorited = isFavorite(item.id);

      return (
        <Pressable
          style={styles.card}
          onPress={() =>
            navigation.navigate('DetailScreen', { itemId: item.id, image: item })
          }>
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />

          {/* Heart button */}
          <Pressable
            style={styles.heartBtn}
            onPress={() => toggleFavorite(item)}
            hitSlop={8}>
            <Text style={[styles.heartIcon, favorited && styles.heartActive]}>
              {favorited ? '♥' : '♡'}
            </Text>
          </Pressable>

          <View style={styles.cardFooter}>
            <Text style={styles.cardAuthor} numberOfLines={1}>
              {item.author}
            </Text>
            <Text style={styles.cardDim}>
              {item.width} × {item.height}
            </Text>
          </View>
        </Pressable>
      );
    },
    [isFavorite, toggleFavorite, navigation],
  );

  const keyExtractor = useCallback(
    (item: PicsumImage): string => item.id,
    [],
  );

  // -- Skeleton loader ------------------------------------------------------
  const renderSkeleton = (): React.JSX.Element => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonFooter}>
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLineShort} />
          </View>
        </View>
      ))}
    </View>
  );

  // -- Empty state ----------------------------------------------------------
  const renderEmpty = (): React.JSX.Element => {
    if (isLoading) {
      return renderSkeleton();
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>No images found</Text>
        <Text style={styles.emptySubtitle}>
          Try adjusting your search or filter.
        </Text>
      </View>
    );
  };

  // -- Footer loader --------------------------------------------------------
  const renderFooter = (): React.JSX.Element | null => {
    if (!isLoadingMore) {
      return null;
    }
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6c63ff" />
        <Text style={styles.footerText}>Loading more…</Text>
      </View>
    );
  };

  // -- Main render ----------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* ── Search Bar ──────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by author…"
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText('')} hitSlop={8}>
            <Text style={styles.clearBtn}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* ── Filter Chips ────────────────────────────────────── */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map(opt => (
          <Pressable
            key={opt.key}
            style={[
              styles.filterChip,
              activeFilter === opt.key && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(opt.key)}>
            <Text
              style={[
                styles.filterChipText,
                activeFilter === opt.key && styles.filterChipTextActive,
              ]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Results count ───────────────────────────────────── */}
      {!isLoading && (
        <Text style={styles.resultCount}>
          {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''}
        </Text>
      )}

      {/* ── Image list ──────────────────────────────────────── */}
      {isLoading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={filteredImages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#6c63ff"
              colors={['#6c63ff']}
            />
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          // Performance optimisations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={6}
          getItemLayout={(_data, index) => ({
            length: IMAGE_HEIGHT + 58 + 12, // image + footer + margin
            offset: (IMAGE_HEIGHT + 58 + 12) * index,
            index,
          })}
        />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    paddingVertical: 0,
  },
  clearBtn: {
    color: '#9ca3af',
    fontSize: 16,
    padding: 4,
  },

  // Filter chips
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#16213e',
  },
  filterChipActive: {
    backgroundColor: '#6c63ff20',
    borderColor: '#6c63ff',
  },
  filterChipText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#6c63ff',
    fontWeight: '600',
  },

  // Result count
  resultCount: {
    color: '#6b7280',
    fontSize: 12,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 4,
  },

  // List
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // Card
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardImage: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#16213e',
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0f0f1acc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 20,
    color: '#9ca3af',
  },
  heartActive: {
    color: '#ef4444',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardAuthor: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  cardDim: {
    color: '#6b7280',
    fontSize: 12,
  },

  // Skeleton
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  skeletonCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  skeletonImage: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#16213e',
  },
  skeletonFooter: {
    padding: 14,
    gap: 8,
  },
  skeletonLine: {
    width: '60%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16213e',
  },
  skeletonLineShort: {
    width: '30%',
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16213e',
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: 14,
  },

  // Footer loader
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 13,
  },
});
