/**
 * HomeScreen – Picsum image gallery with infinite scroll,
 * debounced search, composite author filter, and local favoriting.
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
import { useTheme } from '../../context/ThemeContext';
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
  const { colors, toggleTheme, isDark } = useTheme();

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
          style={[styles.card, { backgroundColor: colors.card }]}
          onPress={() =>
            navigation.navigate('DetailScreen', { itemId: item.id, image: item })
          }>
          <Image
            source={{ uri: thumbnailUrl }}
            style={[styles.cardImage, { backgroundColor: colors.inputBackground }]}
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
            <Text style={[styles.cardAuthor, { color: colors.text }]} numberOfLines={1}>
              {item.author}
            </Text>
            <Text style={[styles.cardDim, { color: colors.textSecondary }]}>
              {item.width} × {item.height}
            </Text>
          </View>
        </Pressable>
      );
    },
    [isFavorite, toggleFavorite, navigation, colors],
  );

  const keyExtractor = useCallback(
    (item: PicsumImage): string => item.id,
    [],
  );

  // -- Skeleton loader ------------------------------------------------------
  const renderSkeleton = (): React.JSX.Element => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.card }]}>
          <View style={[styles.skeletonImage, { backgroundColor: colors.inputBackground }]} />
          <View style={styles.skeletonFooter}>
            <View style={[styles.skeletonLine, { backgroundColor: colors.inputBackground }]} />
            <View style={[styles.skeletonLineShort, { backgroundColor: colors.inputBackground }]} />
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
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No images found</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
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
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Loading more…</Text>
      </View>
    );
  };

  // -- Main render ----------------------------------------------------------

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Theme Toggle */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>FotoOwl</Text>
        <Pressable
          style={[styles.themeToggle, { backgroundColor: colors.card }]}
          onPress={toggleTheme}
          hitSlop={8}>
          <Text style={{ fontSize: 18, color: colors.text }}>
            {isDark ? '☀️' : '🌙'}
          </Text>
        </Pressable>
      </View>

      {/* ── Search Bar ──────────────────────────────────────── */}
      <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by author…"
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText('')} hitSlop={8}>
            <Text style={[styles.clearBtn, { color: colors.textSecondary }]}>✕</Text>
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
              { backgroundColor: colors.inputBackground, borderColor: colors.border },
              activeFilter === opt.key && {
                backgroundColor: `${colors.primary}20`,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setActiveFilter(opt.key)}>
            <Text
              style={[
                styles.filterChipText,
                { color: colors.textSecondary },
                activeFilter === opt.key && { color: colors.primary, fontWeight: '600' },
              ]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Results count ───────────────────────────────────── */}
      {!isLoading && (
        <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
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
              tintColor={colors.primary}
              colors={[colors.primary]}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearBtn: {
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
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Result count
  resultCount: {
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
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: IMAGE_HEIGHT,
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
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  cardDim: {
    fontSize: 12,
  },

  // Skeleton
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  skeletonCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  skeletonImage: {
    width: '100%',
    height: IMAGE_HEIGHT,
  },
  skeletonFooter: {
    padding: 14,
    gap: 8,
  },
  skeletonLine: {
    width: '60%',
    height: 14,
    borderRadius: 7,
  },
  skeletonLineShort: {
    width: '30%',
    height: 10,
    borderRadius: 5,
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtitle: {
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
    fontSize: 13,
  },
});
