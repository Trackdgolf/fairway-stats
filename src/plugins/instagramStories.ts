import { registerPlugin } from '@capacitor/core';

export interface ShareToStoriesOptions {
  /** Base64-encoded PNG image (without data URI prefix) */
  backgroundImage: string;
  /** Optional sticker image as base64 */
  stickerImage?: string;
  /** Optional background top color hex e.g. "#000000" */
  backgroundTopColor?: string;
  /** Optional background bottom color hex e.g. "#000000" */
  backgroundBottomColor?: string;
}

export interface InstagramStoriesPlugin {
  /**
   * Share an image to Instagram Stories using the native iOS/Android pasteboard bridge.
   * Resolves with { success: true } or rejects if Instagram is not installed or sharing fails.
   */
  shareToStories(options: ShareToStoriesOptions): Promise<{ success: boolean }>;

  /**
   * Check if Instagram is installed on the device.
   */
  isInstagramInstalled(): Promise<{ installed: boolean }>;
}

/**
 * Capacitor plugin for Instagram Stories sharing.
 * 
 * On native (iOS/Android), this calls into the Swift/Kotlin plugin.
 * On web, methods will throw "not implemented" — callers should check
 * platform before calling or catch errors.
 */
const InstagramStories = registerPlugin<InstagramStoriesPlugin>('InstagramStories');

export default InstagramStories;
