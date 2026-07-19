/**
 * imageDownloader – utility for downloading images to the device gallery.
 *
 * Flow:
 * 1. Request MEDIA_LIBRARY write permission (explicit check + prompt).
 * 2. Download image to a local temporary cache via expo-file-system.
 * 3. Move the cached file into the native photo gallery via expo-media-library.
 * 4. Return success/failure with a user-friendly message.
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library/legacy';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DownloadResult {
  success: boolean;
  message: string;
}

// ---------------------------------------------------------------------------
// Main download function
// ---------------------------------------------------------------------------

/**
 * Download an image from `url` and save it to the device photo gallery.
 *
 * @param url       – the full URL of the image to download.
 * @param filename  – the desired filename (without path).
 */
export async function downloadImageToGallery(
  url: string,
  filename: string,
): Promise<DownloadResult> {
  try {
    // ── 1) Check & request permissions ─────────────────────────
    const { status: existingStatus } =
      await MediaLibrary.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status: requestedStatus } =
        await MediaLibrary.requestPermissionsAsync();
      finalStatus = requestedStatus;
    }

    if (finalStatus !== 'granted') {
      return {
        success: false,
        message: 'Permission denied. Please allow photo library access in Settings.',
      };
    }

    // ── 2) Download to temporary cache ─────────────────────────
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) {
      return {
        success: false,
        message: 'Unable to access device cache directory.',
      };
    }

    const localUri = `${cacheDir}${filename}`;

    const downloadResult = await FileSystem.downloadAsync(url, localUri);

    if (downloadResult.status !== 200) {
      return {
        success: false,
        message: `Download failed with status ${downloadResult.status}.`,
      };
    }

    // ── 3) Move into photo gallery ─────────────────────────────
    const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);

    // Optionally move into a dedicated album.
    const album = await MediaLibrary.getAlbumAsync('FotoOwl');
    if (album) {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    } else {
      await MediaLibrary.createAlbumAsync('FotoOwl', asset, false);
    }

    return {
      success: true,
      message: 'Image saved to gallery! 📸',
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred.';
    return {
      success: false,
      message: `Download failed: ${errorMessage}`,
    };
  }
}
