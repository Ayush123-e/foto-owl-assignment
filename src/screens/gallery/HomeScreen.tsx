/**
 * HomeScreen – Picsum image gallery using clean Atom components and useGallery hook.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { useGalleryHook } from '../../hooks/useGallery';
import { useDebounce } from '../../hooks/useDebounce';
import { ImageCard } from '../../components/ImageCard';
import { Loader } from '../../components/Loader';
import type { PicsumImage } from '../../types/picsum';
import type { HomeScreenProps } from '../../navigation/Types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

  // -- useGallery Hook encapsulates core data fetching logic ----------------
  const {
    images,
    isLoading,
    isLoadingMore,
    isRefreshing,
    handleLoadMore,
    handleRefresh,
  } = useGalleryHook();

  // -- Search & Filter state ------------------------------------------------
  const [searchText, setSearchText] = useState<string>('');
  const debouncedSearch = useDebounce(searchText, 300);
  const [activeFilter, setActiveFilter] = useState<AuthorFilter>('all');

  // -- Memoised filtered + searched data ------------------------------------
  const filteredImages = useMemo<PicsumImage[]>(() => {
    let result = images;

    // 1) Author filter
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

    // 2) Search
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.trim().toLowerCase();
      result = result.filter(img =>
        img.author.toLowerCase().includes(query),
      );
    }

    return result;
  }, [images, activeFilter, debouncedSearch]);

  const renderItem = useCallback(
    ({ item }: { item: PicsumImage }): React.JSX.Element => (
      <ImageCard
        item={item}
        onPress={() =>
          navigation.navigate('DetailScreen', { itemId: item.id, image: item })
        }
      />
    ),
    [navigation],
  );

  const keyExtractor = useCallback(
    (item: PicsumImage): string => item.id,
    [],
  );

  const renderEmpty = (): React.JSX.Element => {
    if (isLoading) {
      return <Loader variant="skeleton" />;
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

  const renderFooter = (): React.JSX.Element | null => {
    if (!isLoadingMore) {
      return null;
    }
    return (
      <View style={styles.footerLoader}>
        <Loader variant="spinner" />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Loading more…</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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

      {/* Search Bar */}
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

      {/* Filter Chips */}
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

      {/* Results Count */}
      {!isLoading && (
        <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
          {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''}
        </Text>
      )}

      {/* FlatList */}
      {isLoading ? (
        <Loader variant="skeleton" />
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
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={6}
          getItemLayout={(_data, index) => ({
            length: IMAGE_HEIGHT + 58 + 12,
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
