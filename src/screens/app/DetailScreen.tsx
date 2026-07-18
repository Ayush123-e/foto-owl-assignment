/**
 * DetailScreen – full-screen image viewer with Download & Share and themes.
 */

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useGallery } from '../../context/GalleryContext';
import { useTheme } from '../../context/ThemeContext';
import { downloadImageToGallery } from '../../utils/imageDownloader';
import { showToast } from '../../components/Toast';
import type { DetailScreenProps } from '../../navigation/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DetailScreen({
  route,
  navigation,
}: DetailScreenProps): React.JSX.Element {
  const { itemId, image } = route.params;
  const { isFavorite, toggleFavorite } = useGallery();
  const { colors, isDark } = useTheme();

  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const favorited = isFavorite(itemId);

  // Use download_url for high-res, fallback to picsum CDN.
  const highResUrl = image?.download_url ?? `https://picsum.photos/id/${itemId}/1200/800`;
  const previewUrl = `https://picsum.photos/id/${itemId}/${Math.round(SCREEN_WIDTH)}/${Math.round(SCREEN_WIDTH * 0.75)}`;

  // -- Download handler ─────────────────────────────────────────
  const handleDownload = useCallback(async (): Promise<void> => {
    if (isDownloading) {
      return;
    }
    setIsDownloading(true);
    showToast('Starting download…');

    const filename = `foto_owl_${itemId}_${Date.now()}.jpg`;
    const result = await downloadImageToGallery(highResUrl, filename);

    showToast(result.message);
    setIsDownloading(false);
  }, [isDownloading, highResUrl, itemId]);

  // -- Share handler ────────────────────────────────────────────
  const handleShare = useCallback(async (): Promise<void> => {
    try {
      const shareUrl = image?.url ?? `https://picsum.photos/id/${itemId}/info`;
      await Share.share({
        title: image ? `Photo by ${image.author}` : `Photo #${itemId}`,
        message: image
          ? `Check out this photo by ${image.author}!\n\n${shareUrl}`
          : `Check out this photo!\n\n${shareUrl}`,
        url: shareUrl,
      });
    } catch {
      showToast('Share cancelled or failed.');
    }
  }, [image, itemId]);

  // -- Full-screen modal ────────────────────────────────────────
  const renderFullScreenViewer = (): React.JSX.Element => (
    <Modal
      visible={isFullScreen}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={() => setIsFullScreen(false)}>
      <StatusBar hidden={isFullScreen} />
      <View style={styles.fullScreenOverlay}>
        {/* Close button */}
        <Pressable
          style={styles.fullScreenClose}
          onPress={() => setIsFullScreen(false)}
          hitSlop={12}>
          <Text style={styles.fullScreenCloseText}>✕</Text>
        </Pressable>

        {/* Full-res image */}
        <Image
          source={{ uri: highResUrl }}
          style={styles.fullScreenImage}
          resizeMode="contain"
        />

        {/* Bottom action bar */}
        <View style={styles.fullScreenActions}>
          {image && (
            <Pressable
              style={styles.fullScreenBtn}
              onPress={() => toggleFavorite(image)}>
              <Text
                style={[
                  styles.fullScreenBtnIcon,
                  favorited && styles.heartActive,
                ]}>
                {favorited ? '♥' : '♡'}
              </Text>
            </Pressable>
          )}
          <Pressable style={styles.fullScreenBtn} onPress={handleDownload}>
            <Text style={styles.fullScreenBtnIcon}>⤓</Text>
          </Pressable>
          <Pressable style={styles.fullScreenBtn} onPress={handleShare}>
            <Text style={styles.fullScreenBtnIcon}>⎋</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  // -- Main render ──────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* ── Image Preview ─────────────────────────────────── */}
        <Pressable
          style={styles.imageWrapper}
          onPress={() => setIsFullScreen(true)}>
          {!imageLoaded && (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.inputBackground }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading high-res…</Text>
            </View>
          )}
          <Image
            source={{ uri: previewUrl }}
            style={[styles.image, !imageLoaded && styles.imageHidden]}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Tap to expand label */}
          <View style={styles.expandHint}>
            <Text style={styles.expandHintText}>⛶  Tap to view full screen</Text>
          </View>
        </Pressable>

        {/* ── Action Buttons ────────────────────────────────── */}
        <View style={styles.actionsRow}>
          {/* Favorite */}
          {image && (
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.card }]}
              onPress={() => toggleFavorite(image)}>
              <Text
                style={[
                  styles.actionIcon,
                  { color: colors.textSecondary },
                  favorited && styles.heartActive,
                ]}>
                {favorited ? '♥' : '♡'}
              </Text>
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                {favorited ? 'Saved' : 'Save'}
              </Text>
            </Pressable>
          )}

          {/* Download */}
          <Pressable
            style={[styles.actionBtn, styles.downloadBtn, { backgroundColor: colors.primary }]}
            onPress={handleDownload}
            disabled={isDownloading}>
            {isDownloading ? (
              <ActivityIndicator size="small" color={colors.buttonText} />
            ) : (
              <Text style={[styles.actionIcon, { color: colors.buttonText }]}>⤓</Text>
            )}
            <Text style={[styles.actionLabel, { color: colors.buttonText }]}>
              {isDownloading ? 'Saving…' : 'Download'}
            </Text>
          </Pressable>

          {/* Share */}
          <Pressable style={[styles.actionBtn, { backgroundColor: colors.card }]} onPress={handleShare}>
            <Text style={[styles.actionIcon, { color: colors.text }]}>⎋</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Share</Text>
          </Pressable>
        </View>

        {/* ── Metadata Card ─────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {image ? (
            <>
              <Text style={[styles.author, { color: colors.text }]}>{image.author}</Text>

              <View style={styles.metaRow}>
                <MetaItem label="ID" value={image.id} colors={colors} />
                <MetaItem label="Width" value={`${image.width}px`} colors={colors} />
                <MetaItem label="Height" value={`${image.height}px`} colors={colors} />
              </View>

              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Original URL</Text>
              <Text style={[styles.urlText, { color: colors.primary }]} numberOfLines={2}>
                {image.url}
              </Text>

              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Download URL</Text>
              <Text style={[styles.urlText, { color: colors.primary }]} numberOfLines={2}>
                {image.download_url}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.author, { color: colors.text }]}>Image #{itemId}</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                Viewing image with ID{' '}
                <Text style={[styles.bold, { color: colors.text }]}>{itemId}</Text>.
              </Text>
            </>
          )}
        </View>

        {/* ── Back button ───────────────────────────────────── */}
        <Pressable style={[styles.backBtn, { backgroundColor: colors.inputBackground }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtnText, { color: colors.primary }]}>← Go Back</Text>
        </Pressable>
      </ScrollView>

      {/* Full-screen modal viewer */}
      {renderFullScreenViewer()}
    </View>
  );
}

// ---------------------------------------------------------------------------
// MetaItem helper
// ---------------------------------------------------------------------------

function MetaItem({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: any;
}): React.JSX.Element {
  return (
    <View style={[styles.metaItem, { backgroundColor: colors.inputBackground }]}>
      <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: colors.text }]}>{value}</Text>
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
  scroll: {
    paddingBottom: 40,
  },

  // Image preview
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  imageHidden: {
    opacity: 0,
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    fontSize: 12,
    marginTop: 8,
  },
  expandHint: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#0f0f1acc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  expandHintText: {
    color: '#d1d5db',
    fontSize: 12,
  },

  // Action buttons row
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  downloadBtn: {
    // colors.primary applied dynamically
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  heartActive: {
    color: '#ef4444',
  },

  // Card
  card: {
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
  },
  author: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
  },

  // Meta grid
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metaItem: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '600',
  },

  // URL sections
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 12,
  },
  urlText: {
    fontSize: 13,
    lineHeight: 20,
  },

  // Back
  backBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  backBtnText: {
    fontWeight: '600',
    fontSize: 15,
  },

  // Full-screen viewer
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff20',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fullScreenCloseText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  fullScreenActions: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    gap: 16,
  },
  fullScreenBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenBtnIcon: {
    fontSize: 22,
    color: '#ffffff',
  },
});
