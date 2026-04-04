import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import TrackOrderPage from "./pages/TrackOrderPage";

function NavLayout() {
  return (
    <>
      <nav className="sticky top-0 z-50 bg-nav text-nav-foreground shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            {/* Brand */}
            <Link
              to="/"
              className="flex items-center gap-2 font-display font-bold text-[15px] text-nav-foreground/90 hover:text-nav-foreground transition-colors mr-8"
              data-ocid="nav.link"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-primary text-primary-foreground text-xs font-bold">
                Cu
              </span>
              <span className="hidden sm:inline">Copper Orders</span>
            </Link>

            {/* Nav links */}
            <div className="flex items-center gap-1 flex-1">
              <Link
                to="/"
                className="px-3 py-1.5 text-[13px] font-medium text-nav-foreground/75 hover:text-nav-foreground hover:bg-white/10 rounded transition-colors"
                activeProps={{ className: "text-nav-foreground bg-white/15" }}
                data-ocid="nav.link"
              >
                Place Order
              </Link>
              <Link
                to="/track"
                className="px-3 py-1.5 text-[13px] font-medium text-nav-foreground/75 hover:text-nav-foreground hover:bg-white/10 rounded transition-colors"
                activeProps={{ className: "text-nav-foreground bg-white/15" }}
                data-ocid="nav.link"
              >
                Track Order
              </Link>
            </div>

            {/* Admin link */}
            <Link
              to="/admin"
              className="px-3 py-1.5 text-[13px] font-medium text-nav-foreground/60 hover:text-nav-foreground hover:bg-white/10 rounded transition-colors"
              data-ocid="nav.link"
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>
      <Outlet />
      <Toaster richColors />
    </>
  );
}

const rootRoute = createRootRoute({
  component: NavLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const trackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/track",
  component: TrackOrderPage,
});

const routeTree = rootRoute.addChildren([indexRoute, adminRoute, trackRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
