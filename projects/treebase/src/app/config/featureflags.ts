export enum FeatureFlag {
  EnableAuth = 'EnableAuth'
}

export const FeatureFlags: Record<FeatureFlag, boolean> = {
  [FeatureFlag.EnableAuth]: false
};

/**
 * Checks if a feature flag is enabled.
 * Supports overriding via URL query parameters for testing (e.g. ?EnableAuth=false or ?EnableAuth=true).
 */
export function isFeatureEnabled(flag: FeatureFlag | keyof typeof FeatureFlag | string): boolean {
  const flagKey = flag as FeatureFlag;

  if (typeof window !== 'undefined' && window.location && window.location.search) {
    try {
      const params = new URLSearchParams(window.location.search);
      for (const [key, val] of params.entries()) {
        if (key.toLowerCase() === (flagKey as string).toLowerCase()) {
          const lowerVal = val.toLowerCase().trim();
          if (lowerVal === 'false' || lowerVal === '0' || lowerVal === 'no' || lowerVal === 'off') {
            return false;
          }
          if (lowerVal === 'true' || lowerVal === '1' || lowerVal === 'yes' || lowerVal === 'on' || lowerVal === '') {
            return true;
          }
        }
      }
    } catch (e) {
      console.warn('[isFeatureEnabled] Failed to parse URL search parameters:', e);
    }
  }

  return FeatureFlags[flagKey] ?? false;
}
