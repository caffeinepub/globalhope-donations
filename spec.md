# GlobalHope Donations

## Current State

Full-stack charity donation app with:
- Motoko backend with campaigns, donations, UPI QR, image storage, Stripe integration
- React frontend with: HomePage, CampaignsPage, CampaignDetailPage, DonationForm, AdminDashboardPage, AdminCampaignFormPage, AdminPage, ContactPage, DonateHistoryPage, DonateCancelPage, DonateSuccessPage
- Currency dropdown in DonationForm (14 currencies defined in format.ts, no live conversion)
- Footer with legal section links — but legal pages do not exist (links are no-ops)
- No cookie consent banner
- No IP-based currency detection
- No exchange rate conversion
- Backend has no legal page storage

## Requested Changes (Diff)

### Add

1. **Legal pages** (4 new pages):
   - `/legal/privacy` — Privacy Policy
   - `/legal/terms` — Terms of Service
   - `/legal/cookies` — Cookie Policy
   - `/legal/donor-privacy` — Donor Privacy

2. **Currency auto-detection**: On app load, call `https://ipapi.co/json/` (free, no key needed) to detect user's country and pre-select currency (IN→INR, US→USD, GB→GBP, AE→AED, CA→CAD, AU→AUD, SG→SGD, JP→JPY, EU countries→EUR, else USD). Store in a React context/hook.

3. **Live exchange rate fetching** (frontend-side, not backend):
   - Fetch from `https://api.exchangerate-api.com/v4/latest/USD` (free tier, no key)
   - Cache rates in localStorage with 1-hour TTL
   - Use rates to display "You are donating €50 (~$54 USD)" conversion preview in DonationForm
   - Convert entered amount to USD cents when submitting to backend (store amountUSD equivalent)

4. **Donation conversion display**: Below the amount preview in DonationForm, show "~$X USD" if currency is not USD.

5. **Cookie consent banner**: Floating banner at bottom of page on first visit. Two buttons: "Accept All" and "Manage Preferences". Dismisses on accept. Persisted in localStorage.

6. **Backend legal page storage**: Add `LegalPage` type and storage Map in main.mo with fields: `id` (privacy|terms|cookies|donor-privacy), `content` (Text), `updatedAt` (Int). Admin can save/get legal page content via `saveLegalPage` and `getLegalPage` calls.

7. **Admin Legal Pages tab**: New "Legal Pages" tab in AdminDashboardPage with a textarea editor for each of the 4 legal pages. Admin can edit and save content per page.

8. **GDPR data protection notice** on DonationForm: Small text below submit button mentioning data handled per Privacy Policy.

### Modify

1. **Footer**: Wire up the 4 legal links to navigate to actual `/legal/*` routes instead of `onClick={() => {}}`.

2. **DonationForm**: 
   - On mount, auto-select currency from detected location (via hook)
   - Show USD equivalent preview when non-USD currency is selected
   - Narrow currencies to the 9 required: USD, EUR, INR, GBP, AED, CAD, AUD, JPY, SGD

3. **App.tsx**: Add 4 new legal page routes + cookie consent component rendered globally.

4. **Backend Donation type**: Add `amountUSD` field (Nat) to store the USD-equivalent amount. Update `DonationInput` and `Donation` types.

### Remove

Nothing removed.

## Implementation Plan

1. Update `main.mo`: add `LegalPage` type + Map + `saveLegalPage`/`getLegalPage` backend calls; add `amountUSD` to `Donation` and `DonationInput` types.

2. Regenerate `backend.d.ts` via `generate_motoko_code`.

3. Create `src/frontend/src/hooks/useCurrency.ts`: IP geolocation fetch on mount, exchange rate fetch with localStorage cache (1hr TTL), expose `detectedCurrency`, `rates`, `convertToUSD(amount, currency)`.

4. Create 4 legal page components (Privacy, Terms, Cookies, DonorPrivacy) with clean layout (max-w-4xl, TOC sidebar on desktop, large headings, mobile responsive, Navbar + Footer included).

5. Create `CookieConsentBanner.tsx`: bottom fixed banner, persisted dismiss state in localStorage.

6. Update `DonationForm.tsx`: import `useCurrency`, auto-select currency, show USD conversion preview, add GDPR note.

7. Update `Footer.tsx`: wire legal links to router navigate.

8. Update `AdminDashboardPage.tsx`: add "Legal Pages" tab with textarea editors calling `saveLegalPage`/`getLegalPage`.

9. Update `App.tsx`: add legal routes, render `CookieConsentBanner` globally.
