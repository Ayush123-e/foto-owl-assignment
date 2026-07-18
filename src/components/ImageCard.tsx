/**
 * ImageCard – Atom Component representing a gallery card with favorite heart toggles.
 */

import React from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useGallery } from '../context/GalleryContext';
import type { PicsumImage } from '../types/picsum';

interface ImageCardProps {
  item: PicsumImage;
  onPress: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 220;

export function ImageCard({ item, onPress }: ImageCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite } = useGallery();

  const favorited = isFavorite(item.id);
  const thumbnailUrl = `https://picsum.photos/id/${item.id}/${Math.round(SCREEN_WIDTH)}/220`;

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={onPress}>
      <Image
        source={{ uri: thumbnailUrl }}
        style={[styles.cardImage, { backgroundColor: colors.inputBackground }]}
        resizeMode="cover"
      />

      {/* Heart Toggle */}
      <Pressable
        style={styles.heartBtn}
        onPress={() => toggleFavorite(item)}
        hitSlop={8}>
        <Text style={[styles.heartIcon, favorited && styles.heartActive]}>
          {favorited ? '♥' : '♡'}
        </Text>
      </Pressable>

      <View style={styles.cardFooter}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={[styles.cardAuthor, { color: colors.text }]} numberOfLines={1}>
            {item.author}
          </Text>
          <Text style={[styles.cardId, { color: colors.textSecondary }]}>
            ID: #{item.id}
          </Text>
        </View>
        <Text style={[styles.cardDim, { color: colors.textSecondary }]}>
          {item.width} × {item.height}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  cardId: {
    fontSize: 12,
    marginTop: 2,
  },
  cardDim: {
    fontSize: 12,
  },
});
