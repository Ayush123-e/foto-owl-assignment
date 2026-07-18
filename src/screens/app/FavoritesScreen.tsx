/**
 * FavoritesScreen – displays all images the user has favorited.
 * Reads from GalleryContext and renders a grid of favorited images.
 */

import React, { useCallback, useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useGallery } from '../../context/GalleryContext';
import type { PicsumImage } from '../../types/picsum';
import type { FavoritesScreenProps } from '../../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_GAP = 10;
const PADDING = 16;
const TILE_WIDTH = (SCREEN_WIDTH - PADDING * 2 - COLUMN_GAP) / 2;

export default function FavoritesScreen(
  _props: FavoritesScreenProps,
): React.JSX.Element {
  const { favorites, toggleFavorite } = useGallery();

  const favoritesList = useMemo<PicsumImage[]>(
    () => Object.values(favorites),
    [favorites],
  );

  const renderItem = useCallback(
    ({ item }: { item: PicsumImage }): React.JSX.Element => {
      const thumbnailUrl = `https://picsum.photos/id/${item.id}/${Math.round(
        TILE_WIDTH,
      )}/${Math.round(TILE_WIDTH)}`;

      return (
        <View style={styles.tile}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.tileImage}
            resizeMode="cover"
          />
          <Pressable
            style={styles.removeBtn}
            onPress={() => toggleFavorite(item)}
            hitSlop={6}>
            <Text style={styles.removeBtnText}>♥</Text>
          </Pressable>
          <Text style={styles.tileAuthor} numberOfLines={1}>
            {item.author}
          </Text>
        </View>
      );
    },
    [toggleFavorite],
  );

  const keyExtractor = useCallback(
    (item: PicsumImage): string => item.id,
    [],
  );

  const renderEmpty = (): React.JSX.Element => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>♡</Text>
      <Text style={styles.emptyTitle}>No favorites yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the heart icon on any image to save it here.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {favoritesList.length > 0 && (
        <Text style={styles.count}>
          {favoritesList.length} favorite{favoritesList.length !== 1 ? 's' : ''}
        </Text>
      )}
      <FlatList
        data={favoritesList}
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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  count: {
    color: '#6b7280',
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

  // Tile
  tile: {
    width: TILE_WIDTH,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tileImage: {
    width: '100%',
    height: TILE_WIDTH,
    backgroundColor: '#16213e',
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
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
    padding: 10,
  },

  // Empty
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
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
