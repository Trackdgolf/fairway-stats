import { Capacitor } from '@capacitor/core';
import { 
  Purchases, 
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesOfferings,
  type PurchasesPackage
} from '@revenuecat/purchases-capacitor';

// Entitlement identifier - MUST match RevenueCat dashboard exactly
export const PREMIUM_ENTITLEMENT_ID = 'Premium';

// Check if we're running on a native platform
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

// Debug logging helper - logs entitlement state without exposing secrets
export const logCustomerInfoDebug = (customerInfo: CustomerInfo, context: string): void => {
  const appUserID = customerInfo.originalAppUserId;
  const entitlements = customerInfo.entitlements?.active || {};
  const premiumEntitlement = entitlements[PREMIUM_ENTITLEMENT_ID];
  
  console.log(`RevenueCat Debug [${context}]:`, {
    appUserID: appUserID ? appUserID.substring(0, 8) + '...' : 'anonymous',
    isPremiumActive: !!premiumEntitlement,
    entitlementIds: Object.keys(entitlements),
    premiumExpiration: premiumEntitlement?.expirationDate || 'none',
    willRenew: premiumEntitlement?.willRenew ?? null,
  });
};

// Initialize RevenueCat SDK
export const initializeRevenueCat = async (apiKey: string): Promise<void> => {
  if (!isNativePlatform()) {
    console.log('RevenueCat: Skipping initialization on web platform');
    return;
  }

  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    await Purchases.configure({
      apiKey,
    });
    console.log('RevenueCat: Initialized successfully');
  } catch (error) {
    console.error('RevenueCat: Failed to initialize', error);
    throw error;
  }
};

// Set the user ID for RevenueCat (should match your auth user ID)
export const setRevenueCatUserId = async (userId: string): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    await Purchases.logIn({ appUserID: userId });
    console.log('RevenueCat: User logged in', userId);
  } catch (error) {
    console.error('RevenueCat: Failed to set user ID', error);
    throw error;
  }
};

// Log out the current RevenueCat user
export const logOutRevenueCat = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    await Purchases.logOut();
    console.log('RevenueCat: User logged out');
  } catch (error) {
    console.error('RevenueCat: Failed to log out', error);
  }
};

// Get current customer info (subscription status)
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  if (!isNativePlatform()) return null;

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('RevenueCat: Failed to get customer info', error);
    return null;
  }
};

// Get available offerings (subscription packages)
export const getOfferings = async (): Promise<PurchasesOfferings | null> => {
  if (!isNativePlatform()) return null;

  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('RevenueCat: Failed to get offerings', error);
    return null;
  }
};

// Purchase a package
export const purchasePackage = async (pkg: PurchasesPackage): Promise<CustomerInfo | null> => {
  if (!isNativePlatform()) return null;

  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    return customerInfo;
  } catch (error: any) {
    // Handle user cancellation gracefully
    if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      console.log('RevenueCat: Purchase cancelled by user');
      return null;
    }
    console.error('RevenueCat: Purchase failed', error);
    throw error;
  }
};

// Restore previous purchases
export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  if (!isNativePlatform()) return null;

  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('RevenueCat: Failed to restore purchases', error);
    throw error;
  }
};

// Check if user has active premium entitlement
export const hasActiveEntitlement = (customerInfo: CustomerInfo, entitlementId: string = PREMIUM_ENTITLEMENT_ID): boolean => {
  const isActive = customerInfo.entitlements.active[entitlementId] !== undefined;
  console.log(`RevenueCat: hasActiveEntitlement('${entitlementId}') = ${isActive}`);
  return isActive;
};

// Get the active product ID if subscribed
export const getActiveProductId = (customerInfo: CustomerInfo, entitlementId: string = PREMIUM_ENTITLEMENT_ID): string | null => {
  const entitlement = customerInfo.entitlements.active[entitlementId];
  return entitlement?.productIdentifier ?? null;
};
