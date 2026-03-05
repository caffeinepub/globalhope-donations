import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import CookieConsentBanner from "./components/CookieConsentBanner";
import AdminCampaignFormPage from "./pages/AdminCampaignFormPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminPage from "./pages/AdminPage";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import CampaignsPage from "./pages/CampaignsPage";
import ContactPage from "./pages/ContactPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import DonateCancelPage from "./pages/DonateCancelPage";
import DonateHistoryPage from "./pages/DonateHistoryPage";
import DonateSuccessPage from "./pages/DonateSuccessPage";
import DonorPrivacyPage from "./pages/DonorPrivacyPage";
import HomePage from "./pages/HomePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <CookieConsentBanner />
      <Toaster position="top-right" richColors />
    </>
  ),
  notFoundComponent: () => <Navigate to="/" />,
});

// Page routes
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const campaignsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaigns",
  component: CampaignsPage,
});

const campaignDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/campaign/$id",
  component: CampaignDetailPage,
});

const donateSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/donate/success",
  component: DonateSuccessPage,
});

const donateCancelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/donate/cancel",
  component: DonateCancelPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  component: AdminDashboardPage,
});

const adminCampaignNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/campaigns/new",
  component: AdminCampaignFormPage,
});

const adminCampaignEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/campaigns/$id/edit",
  component: AdminCampaignFormPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});

const donateHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/donate-history",
  component: DonateHistoryPage,
});

// Legal pages
const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal/privacy",
  component: PrivacyPolicyPage,
});

const termsOfServiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal/terms",
  component: TermsOfServicePage,
});

const cookiePolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal/cookies",
  component: CookiePolicyPage,
});

const donorPrivacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal/donor-privacy",
  component: DonorPrivacyPage,
});

// Export routes for usage in pages
export { campaignDetailRoute, adminCampaignEditRoute };

// Build the route tree
const routeTree = rootRoute.addChildren([
  homeRoute,
  campaignsRoute,
  campaignDetailRoute,
  donateSuccessRoute,
  donateCancelRoute,
  adminRoute,
  adminDashboardRoute,
  adminCampaignNewRoute,
  adminCampaignEditRoute,
  contactRoute,
  donateHistoryRoute,
  privacyPolicyRoute,
  termsOfServiceRoute,
  cookiePolicyRoute,
  donorPrivacyRoute,
]);

// Create the router
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
