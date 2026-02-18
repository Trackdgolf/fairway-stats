/**
 * Normalize a referral code: trim whitespace, remove internal spaces, uppercase.
 */
export const normalizeReferralCode = (code: string): string => {
  return code.trim().replace(/\s+/g, '').toUpperCase();
};
