# GlobalHope Donations

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full-stack charity fundraising platform with admin and donor flows
- Campaign management: create, edit, delete campaigns with title, description, category, target amount, deadline, media (images + video URLs)
- Donation flow: predefined + custom amounts, multi-currency selector (USD, EUR, INR, GBP, AED, CAD, AUD), anonymous option, donor name/email/phone fields
- Stripe payment integration for international cards
- Admin panel: secure login, dashboard with stats, campaign CRUD, donation list view, total collected amount
- Homepage: hero section, featured campaigns with progress bars, supporters count, impact breakdown, campaign gallery, contact section, footer
- Campaign detail page: full info, live progress bar, supporter count, media gallery, donation form
- Payment success/thank-you page
- Role-based access: admin vs. donor/visitor
- Blob storage for campaign images

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

**Backend (Motoko)**
1. User/auth model: admin role via authorization component
2. Campaign record: id, title, description, imageIds[], videoUrls[], targetAmount (Nat), currentAmount (Nat), category, deadline, createdAt, active flag
3. Donation record: id, campaignId, donorName, donorEmail, donorPhone, amount, currency, paymentMethod, transactionId, anonymous, createdAt
4. Campaign CRUD APIs (admin only for create/update/delete, public read)
5. Donation submission API (public)
6. Stats query: total raised, supporter count per campaign
7. Stripe payment intent creation via component

**Frontend (React + Tailwind)**
1. Layout: top nav (logo + nav links + donate CTA), footer
2. Homepage: hero, campaign cards grid with progress bars, impact section, contact form
3. Campaign detail page: left panel (info, progress, gallery), right panel (donation form card)
4. Donation form: amount selector, currency dropdown, donor fields, anonymous toggle, Stripe payment
5. Payment success page with thank-you message
6. Admin dashboard: login gate, stats overview cards, campaigns table (CRUD), donations table
7. Campaign create/edit form with image upload and video URL field
8. Mobile-responsive throughout
