/**
 * FavoritesScreen – displays all images the user has favorited with themes.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useGallery } from '../../context/GalleryContext';
import { useTheme } from '../../context/ThemeContext';
import type { PicsumImage } from '../../types/picsum';
import type { FavoritesScreenProps } from '../../navigation/Types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_GAP = 10;
const PADDING = 16;
const TILE_WIDTH = (SCREEN_WIDTH - PADDING * 2 - COLUMN_GAP) / 2;

export default function FavoritesScreen(
  _props: FavoritesScreenProps,
): React.JSX.Element {
  const { favorites, toggleFavorite } = useGallery();
  const { colors } = useTheme();
  const [searchText, setSearchText] = useState<string>('');

  const favoritesList = useMemo<PicsumImage[]>(
    () => Object.values(favorites),
    [favorites],
  );

  const filteredFavoritesList = useMemo<PicsumImage[]>(() => {
    if (!searchText.trim()) {
      return favoritesList;
    }
    const query = searchText.trim().toLowerCase();
    return favoritesList.filter(item =>
      item.author.toLowerCase().includes(query),
    );
  }, [favoritesList, searchText]);

  const renderItem = useCallback(
    ({ item }: { item: PicsumImage }): React.JSX.Element => {
      const thumbnailUrl = `https://picsum.photos/id/${item.id}/${Math.round(
        TILE_WIDTH,
      )}/${Math.round(TILE_WIDTH)}`;

      return (
        <View style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={[styles.tileImage, { backgroundColor: colors.inputBackground }]}
            resizeMode="cover"
          />
          <Pressable
            style={styles.removeBtn}
            onPress={() => toggleFavorite(item)}
            hitSlop={6}>
            <Text style={styles.removeBtnText}>♥</Text>
          </Pressable>
          <Text style={[styles.tileAuthor, { color: colors.text }]} numberOfLines={1}>
            {item.author}
          </Text>
        </View>
      );
    },
    [toggleFavorite, colors],
  );

  const keyExtractor = useCallback(
    (item: PicsumImage): string => item.id,
    [],
  );

  const renderEmpty = (): React.JSX.Element => {
    if (favoritesList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>♡</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No favorites yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Tap the heart icon on any image to save it here.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Try adjusting your search for "{searchText}".
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      {favoritesList.length > 0 && (
        <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search favorites by author…"
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
      )}

      {favoritesList.length > 0 && (
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          Showing {filteredFavoritesList.length} of {favoritesList.length} favorite{favoritesList.length !== 1 ? 's' : ''}
        </Text>
      )}

      <FlatList
        data={filteredFavoritesList}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
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
  count: {
    fontSize: 12,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
  },
  list: {
    padding: PADDING,
    paddingBottom: 24,
  },
  row: {
    gap: COLUMN_GAP,
    marginBottom: COLUMN_GAP,
  },
  tile: {
    width: TILE_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  tileImage: {
    width: '100%',
    height: TILE_WIDTH,
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0f0f1acc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    fontSize: 16,
    color: '#ef4444',
  },
  tileAuthor: {
    fontSize: 13,
    fontWeight: '500',
    padding: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 56,
    color: '#4b5563',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
