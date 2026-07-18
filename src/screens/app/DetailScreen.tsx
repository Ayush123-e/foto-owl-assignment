/**
 * DetailScreen – displays a full-size Picsum image with metadata.
 * Receives `itemId` and optional `image` via route params.
 */

import React from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useGallery } from '../../context/GalleryContext';
import type { DetailScreenProps } from '../../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DetailScreen({
  route,
  navigation,
}: DetailScreenProps): React.JSX.Element {
  const { itemId, image } = route.params;
  const { isFavorite, toggleFavorite } = useGallery();

  const favorited = isFavorite(itemId);
  const imageUrl = `https://picsum.photos/id/${itemId}/${Math.round(SCREEN_WIDTH)}/${Math.round(SCREEN_WIDTH * 0.75)}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}>
      {/* ── Image ──────────────────────────────────────────── */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Heart overlay */}
        {image && (
          <Pressable
            style={styles.heartBtn}
            onPress={() => toggleFavorite(image)}
            hitSlop={8}>
            <Text style={[styles.heartIcon, favorited && styles.heartActive]}>
              {favorited ? '♥' : '♡'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* ── Metadata card ──────────────────────────────────── */}
      <View style={styles.card}>
        {image ? (
          <>
            <Text style={styles.author}>{image.author}</Text>

            <View style={styles.metaRow}>
              <MetaItem label="ID" value={image.id} />
              <MetaItem label="Width" value={`${image.width}px`} />
              <MetaItem label="Height" value={`${image.height}px`} />
            </View>

            <Text style={styles.sectionLabel}>Original URL</Text>
            <Text style={styles.urlText} numberOfLines={2}>
              {image.url}
            </Text>

            <Text style={styles.sectionLabel}>Download URL</Text>
            <Text style={styles.urlText} numberOfLines={2}>
              {image.download_url}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.author}>Image #{itemId}</Text>
            <Text style={styles.description}>
              Viewing image with ID <Text style={styles.bold}>{itemId}</Text>.
            </Text>
          </>
        )}
      </View>

      {/* ── Back button ────────────────────────────────────── */}
      <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>← Go Back</Text>
      </Pressable>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// MetaItem helper
// ---------------------------------------------------------------------------

function MetaItem({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
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
  scroll: {
    paddingBottom: 40,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    backgroundColor: '#16213e',
  },
  heartBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0f0f1acc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 24,
    color: '#9ca3af',
  },
  heartActive: {
    color: '#ef4444',
  },

  // Card
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginTop: -24,
  },
  author: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
    color: '#ffffff',
  },

  // Meta grid
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metaItem: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
  },

  // URL sections
  sectionLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 12,
  },
  urlText: {
    fontSize: 13,
    color: '#6c63ff',
    lineHeight: 20,
  },

  // Back
  backBtn: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#6c63ff',
    fontWeight: '600',
    fontSize: 15,
  },
});
