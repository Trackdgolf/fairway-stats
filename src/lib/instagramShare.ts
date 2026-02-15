import { Capacitor } from '@capacitor/core';
import InstagramStories from '@/plugins/instagramStories';

/**
 * Check if we're on native and Instagram is available.
 */
export const canShareToInstagram = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { installed } = await InstagramStories.isInstagramInstalled();
    return installed;
  } catch {
    return false;
  }
};

/**
 * Share a canvas element as a background image to Instagram Stories.
 * Falls back to the native share sheet if Instagram sharing fails.
 * 
 * @param canvas - The HTML canvas to share
 * @param fallbackShare - Optional fallback function (e.g. navigator.share)
 * @returns true if shared successfully
 */
export const shareToInstagramStory = async (
  canvas: HTMLCanvasElement,
  fallbackShare?: () => Promise<void>,
): Promise<boolean> => {
  // Extract base64 without the data URI prefix
  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');

  if (!Capacitor.isNativePlatform()) {
    if (fallbackShare) {
      await fallbackShare();
      return true;
    }
    return false;
  }

  try {
    const { success } = await InstagramStories.shareToStories({
      backgroundImage: base64,
    });
    return success;
  } catch (err) {
    console.warn('Instagram Stories share failed, trying fallback:', err);
    if (fallbackShare) {
      await fallbackShare();
      return true;
    }
    return false;
  }
};
