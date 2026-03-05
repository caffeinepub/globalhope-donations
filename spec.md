# GlobalHope Donations

## Current State
- Full-stack charity donation platform with campaign management
- Admin access uses Internet Identity (ICP's cryptographic auth) — no username/password
- Public pages: Home, Campaigns, Campaign Detail, Donate Success/Cancel
- Admin pages: /admin (Internet Identity login info), /admin/dashboard (campaigns + donations management)
- Backend: Motoko with authorization, blob-storage, Stripe, http-outcalls components
- No standalone Contact page or Donate History page for public users

## Requested Changes (Diff)

### Add
- **Admin email/password login**: Replace Internet Identity flow on /admin with a hardcoded credential check (email: ankitasingh.ltd@gmail.com, password: Ankitasingh7860@@). Store session in localStorage. Redirect to /admin/dashboard on success.
- **Admin logout**: Clear localStorage session and redirect to /admin login page
- **Contact page** (/contact): Public contact form with name, email, phone, message fields. Submissions stored in backend and viewable in admin dashboard.
- **Donate History page** (/donate-history): Public page where a user enters their email to look up their own past donations across all campaigns.
- **Admin: Messages/Contact section**: New tab/section in admin dashboard showing all submitted contact form messages with ability to mark read/delete.
- **Admin: Users section**: Tab showing all unique donor emails + names from donation records.

### Modify
- **AdminPage (/admin)**: Replace Internet Identity login with a simple email + password form. On submit, check credentials against hardcoded values. Show error on wrong credentials. On success store `admin_authenticated=true` and `admin_email` in localStorage, redirect to /admin/dashboard.
- **AdminDashboardPage**: Replace Internet Identity identity check with localStorage session check. Logout clears localStorage and redirects to /admin.
- **Navbar**: Add "Contact" link in public nav. Remove any "Admin" nav link (admin accessed directly via /admin URL).
- **Backend (main.mo)**: Add `ContactMessage` type and storage, `submitContactMessage` (public), `getAllContactMessages` (admin), `deleteContactMessage` (admin), `getDonationsByEmail` (public query by email for donate history).

### Remove
- Internet Identity login button and Principal ID flow from /admin page
- "How to Get Admin Access" info card from /admin page
- "Go to Admin" button / admin notice banners (already done in v3)

## Implementation Plan
1. Update backend: add ContactMessage type, submitContactMessage, getAllContactMessages, deleteContactMessage, getDonationsByEmail
2. Replace AdminPage with email/password login form using hardcoded credentials + localStorage session
3. Update AdminDashboardPage: replace II check with localStorage auth check; update logout to clear localStorage
4. Add ContactPage (/contact) with form
5. Add DonateHistoryPage (/donate-history) with email lookup
6. Add admin Messages section in dashboard showing contact submissions
7. Add admin Users section showing unique donors
8. Update App.tsx routes to include /contact and /donate-history
9. Update Navbar: add Contact link, remove Admin link
