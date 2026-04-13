

# Re-enable VITE_FORCE_PREMIUM Dev Bypass

## Problem
`VITE_FORCE_PREMIUM=true` is set in `.env` but `usePremiumStatus.ts` doesn't check it, so premium gates are enforced even during development.

## Change
In `src/hooks/usePremiumStatus.ts`, add a check at the top:

```typescript
const forcePremium = import.meta.env.VITE_FORCE_PREMIUM === 'true';
```

Then use it in the return values:
- `isPremium` becomes `forcePremium || (isNative ? isRcPremium : isDbPremium)`
- `loading` stays the same (no fake loading when forced)
- `status` derives from the updated `isPremium`

This is a single-file, ~3 line change. The flag only works during development (Vite env vars are compile-time), so it won't affect production builds unless explicitly set.

