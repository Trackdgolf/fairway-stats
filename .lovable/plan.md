

# Android / Google Play Deployment — Code Review

## Summary

Your codebase is already well-structured for cross-platform support. Most of the code is platform-agnostic via Capacitor. Here's what needs attention:

---

## 1. PaywallModal — Apple-specific subscription disclosure text

**File:** `src/components/PaywallModal.tsx` (line 425-431)

The subscription disclosure currently says:
> "Payment will be charged to your **Apple ID** account... manage or cancel your subscription in your **App Store** account settings."

**Change:** Detect the platform and show the correct store-specific text:
- iOS → "Apple ID" / "App Store"
- Android → "Google account" / "Google Play"

Uses `Capacitor.getPlatform()` to determine which text to show.

---

## 2. RevenueCat — Separate API key for Android

**File:** `src/hooks/useRevenueCat.ts`

RevenueCat requires a **separate public API key** for Google Play (different from the Apple key). The `initializeRevenueCat` call currently uses a single `VITE_REVENUECAT_PUBLIC_API_KEY`.

**Change:** Add a second env var `VITE_REVENUECAT_ANDROID_API_KEY` and select the correct key based on platform:
- iOS → use existing Apple key
- Android → use new Android key

You'll need to create the Android app in your RevenueCat dashboard and get the Google Play API key.

---

## 3. Instagram Stories plugin — Android implementation

**File:** `src/plugins/instagramStories.ts`

The TypeScript interface is already cross-platform, but you'll need to ensure the **Kotlin native plugin code** exists in your `android/` directory (matching the Swift implementation in `ios/`). This is done outside Lovable in your local project.

---

## 4. No other blockers

Everything else is already cross-platform:
- Capacitor storage adapter works on both platforms
- Supabase client logic is platform-aware (native vs web)
- RevenueCat SDK (`@revenuecat/purchases-capacitor`) supports both iOS and Android
- All UI components are web-based and render identically

---

## Steps to deploy on Android

After the code changes above:

1. Set up your app in the **RevenueCat dashboard** for Google Play and get the Android API key
2. Set up your app in **Google Play Console** (package name, signing, listing)
3. In your local project: `npx cap add android` → `npx cap sync`
4. Add the Kotlin implementation for the Instagram Stories plugin in `android/`
5. Open in Android Studio: `npx cap open android`
6. Build, test, and submit to Google Play

---

## Technical Details

| Item | Change |
|------|--------|
| `PaywallModal.tsx` | Import `Capacitor`, use `getPlatform()` to swap "Apple ID"/"App Store" with "Google account"/"Google Play" |
| `useRevenueCat.ts` | Add platform check to select correct RC API key |
| `.env` | Add `VITE_REVENUECAT_ANDROID_API_KEY` |
| `android/` dir | Add Kotlin InstagramStories plugin (local, outside Lovable) |

