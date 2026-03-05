# GlobalHope Donations

## Current State
The app has a full charity donation platform with campaign management, admin dashboard, UPI QR upload, multi-currency support, legal pages, and Stripe payment. Admin login uses email/password (not Internet Identity). The backend requires admin-level access control for all write operations.

## Requested Changes (Diff)

### Add
- `useAdminActor.ts` hook: initializes the admin token on the anonymous actor whenever an admin is logged in (email/password), resolving the root authorization failure

### Modify
- `useQueries.ts`: all admin-only hooks use `useAdminActor` instead of `useActor` so they carry the admin token
- `AdminPage.tsx`: emits a localStorage signal after login to trigger token re-initialization
- `AdminCampaignFormPage.tsx`: the `isAdmin` redirect guard checks localStorage before redirecting, preventing a race condition that redirected admins back to login before the token was ready

### Remove
- Nothing removed

## Implementation Plan
1. Create `useAdminActor.ts` — wraps the anonymous actor, calls `_initializeAccessControlWithSecret` when admin is logged in, polls localStorage for login signal
2. Update `useQueries.ts` — swap `useActor` → `useAdminActor` for all admin mutations and queries
3. Update `AdminPage.tsx` — write `admin_token_init_needed` to localStorage on successful login
4. Update `AdminCampaignFormPage.tsx` — fix redirect guard race condition
