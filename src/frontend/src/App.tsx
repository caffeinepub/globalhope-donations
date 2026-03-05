import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AdminCampaignFormPage from "./pages/AdminCampaignFormPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminPage from "./pages/AdminPage";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import CampaignsPage from "./pages/CampaignsPage";
import DonateCancelPage from "./pages/DonateCancelPage";
import DonateSuccessPage from "./pages/DonateSuccessPage";
import HomePage from "./pages/HomePage";

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
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
