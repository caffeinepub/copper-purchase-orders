import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import AdminPage from "./pages/AdminPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import EmailGatePage from "./pages/EmailGatePage";
import OrderFormPage from "./pages/OrderFormPage";
import TrackOrderPage from "./pages/TrackOrderPage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexPage,
});

function IndexPage() {
  const [gatedEmail, setGatedEmail] = useState<string | null>(() =>
    sessionStorage.getItem("gated_email"),
  );
  const [orderId, setOrderId] = useState<bigint | null>(null);

  if (orderId !== null) {
    return (
      <ConfirmationPage
        orderId={orderId}
        onReset={() => {
          setOrderId(null);
          setGatedEmail(null);
          sessionStorage.removeItem("gated_email");
        }}
      />
    );
  }

  if (gatedEmail) {
    return (
      <OrderFormPage email={gatedEmail} onSuccess={(id) => setOrderId(id)} />
    );
  }

  return (
    <EmailGatePage
      onEmailSubmit={(email) => {
        sessionStorage.setItem("gated_email", email);
        setGatedEmail(email);
      }}
    />
  );
}

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
