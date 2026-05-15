## Root cause

The pre-purchase identity check in `src/hooks/useRevenueCat.ts` (the `purchase` function) compares `customerInfo.originalAppUserId` against `user.id`. For any **new user**, RevenueCat first creates an **anonymous ID** (`$RCAnonymousID:...`) when the SDK initializes. When we later call `Purchases.logIn({ appUserID: user.id })`, RevenueCat **aliases** the anonymous ID to the Supabase user ID — but `originalAppUserId` keeps returning the *original* anonymous ID it was first created under, not the currently logged-in App User ID.

Result: for every new user, the check at line 258 (`verifyInfo?.originalAppUserId !== user.id`) is always true after `setRevenueCatUserId`, so the function aborts with **"Identity verification failed. Please restart the app and try again"** and the purchase never proceeds.

Existing premium users are unaffected because they typically already have premium when they reach the paywall (or were grandfathered before this check was added).

## Fix

Stop relying on `originalAppUserId` for the "is the SDK currently logged in as this user?" check. RevenueCat exposes the **current** App User ID via `Purchases.getAppUserID()` — that's the value that actually drives which RC customer a purchase is attributed to.

### Changes

1. **`src/lib/revenueCat.ts`** — add a small helper:
   ```ts
   export const getCurrentAppUserId = async (): Promise<string | null> => {
     if (!isNativePlatform()) return null;
     const { appUserID } = await Purchases.getAppUserID();
     return appUserID ?? null;
   };
   ```
   Also update `logCustomerInfoDebug` to log both `originalAppUserId` and current `appUserID` so future debugging is clearer.

2. **`src/hooks/useRevenueCat.ts`** — in `purchase()`:
   - Replace `currentInfo?.originalAppUserId` with `await getCurrentAppUserId()`.
   - After calling `setRevenueCatUserId(user.id)`, verify with `getCurrentAppUserId()` (not `getCustomerInfo().originalAppUserId`).
   - Only abort with the "Identity verification failed" toast if the **current** App User ID still doesn't match `user.id`.
   - Keep the existing fallback that calls `setRevenueCatUserId` when there's a mismatch.

3. **`src/hooks/useRevenueCat.ts`** — in the startup `fetchCustomerData` warning (line 153) and **`src/components/PaywallModal.tsx`** identity-check logging: switch from `originalAppUserId` to current `appUserID` so the warnings reflect reality. Anonymous-ID detection (`startsWith('$RCAnonymousID')`) stays valid against the current ID too.

4. No DB / RC dashboard / config changes required. Webhook + entitlement linking already use the correct App User ID server-side.

## Verification

- New account on a fresh native install → open paywall → tap monthly or annual → purchase sheet appears, purchase completes, premium activates.
- Console shows `currentAppUserId === supabaseUserId` after `setRevenueCatUserId`.
- Existing premium users continue to see Premium status; Restore Purchases still works.
- Web (non-native) is unaffected — the check is gated by `isNative`.
