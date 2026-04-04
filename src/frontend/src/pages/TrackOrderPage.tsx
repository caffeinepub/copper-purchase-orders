import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  Search,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  CopperProductType,
  OrderStatus,
  type PurchaseOrder,
  SellerAvailability,
} from "../backend";
import { getBackend } from "../backendService";

const PRODUCT_LABELS: Record<string, string> = {
  [CopperProductType.copperWire]: "Copper Wire",
  [CopperProductType.copperSheet]: "Copper Sheet",
  [CopperProductType.copperPipe]: "Copper Pipe",
  [CopperProductType.copperRod]: "Copper Rod",
};

const STEPPER_STEPS = [
  "Order Placed",
  "Under Review",
  "Processing",
  "Shipped",
  "Completed",
];

function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case OrderStatus.pending:
      return 1;
    case OrderStatus.processing:
      return 2;
    case OrderStatus.shipped:
      return 3;
    case OrderStatus.completed:
      return 4;
    case OrderStatus.cancelled:
      return -1;
    default:
      return 0;
  }
}

function AvailabilityBadge({
  availability,
}: { availability: SellerAvailability | null }) {
  if (!availability) {
    return (
      <Badge variant="secondary" className="text-xs">
        Awaiting Reply
      </Badge>
    );
  }
  if (availability === SellerAvailability.available) {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Available
      </Badge>
    );
  }
  if (availability === SellerAvailability.partial) {
    return (
      <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
        <AlertCircle className="w-3 h-3 mr-1" /> Partial
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
      <XCircle className="w-3 h-3 mr-1" /> Not Available
    </Badge>
  );
}

export default function TrackOrderPage() {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [emailInput, setEmailInput] = useState(
    () => sessionStorage.getItem("order_email") ?? "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    const idNum = Number.parseInt(orderIdInput.trim(), 10);
    if (Number.isNaN(idNum) || idNum <= 0) {
      toast.error("Please enter a valid Order ID.");
      return;
    }
    const emailTrimmed = emailInput.trim();
    if (!emailTrimmed) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    setOrder(null);
    setSearched(false);

    try {
      const result = await (await getBackend()).trackOrder(
        BigInt(idNum),
        emailTrimmed,
      );
      setSearched(true);
      if (result === null) {
        setNotFound(true);
      } else {
        setOrder(result);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to track order. Please try again.");
      setSearched(true);
    } finally {
      setIsLoading(false);
    }
  }

  const stepIndex = order ? getStepIndex(order.status) : 0;
  const isCancelled = order?.status === OrderStatus.cancelled;

  return (
    <main className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-1">
            Buyer Portal
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Track Order
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your Order ID and email to see the current status.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Track form */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Track Your Copper Order</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter the Order ID you received after submitting your order.
            </p>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleTrack}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1">
                <Label
                  htmlFor="order-id"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Order ID
                </Label>
                <Input
                  id="order-id"
                  type="number"
                  placeholder="e.g. 12345"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="mt-1"
                  min="1"
                  data-ocid="track.input"
                />
              </div>
              <div className="flex-1">
                <Label
                  htmlFor="track-email"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  Email Address
                </Label>
                <Input
                  id="track-email"
                  type="email"
                  placeholder="you@company.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="mt-1"
                  autoComplete="email"
                  data-ocid="track.input"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
                  data-ocid="track.primary_button"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Tracking…
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Track Order
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12" data-ocid="track.loading_state">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              Fetching your order…
            </p>
          </div>
        )}

        {/* Not found */}
        {searched && notFound && !isLoading && (
          <Card
            className="shadow-card border-border"
            data-ocid="track.error_state"
          >
            <CardContent className="py-12 text-center">
              <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-foreground mb-1">
                Order Not Found
              </p>
              <p className="text-sm text-muted-foreground">
                No order matches that ID and email. Please double-check your
                details.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Order details */}
        {order && !isLoading && (
          <div
            className="space-y-5 animate-fade-in"
            data-ocid="track.success_state"
          >
            {/* Status stepper */}
            {!isCancelled && (
              <Card className="shadow-card border-border overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Order Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-0">
                    {STEPPER_STEPS.map((step, i) => {
                      const isActive = i <= stepIndex;
                      const isCurrent = i === stepIndex;
                      return (
                        <div key={step} className="flex-1 flex items-center">
                          <div className="flex flex-col items-center flex-1">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                                isCurrent
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : isActive
                                    ? "bg-primary/20 text-primary border-primary/40"
                                    : "bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              {isActive ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                i + 1
                              )}
                            </div>
                            <p
                              className={`text-[10px] mt-1.5 text-center leading-tight font-medium ${
                                isCurrent
                                  ? "text-primary"
                                  : isActive
                                    ? "text-foreground/70"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {step}
                            </p>
                          </div>
                          {i < STEPPER_STEPS.length - 1 && (
                            <div
                              className={`flex-1 h-0.5 -mt-5 mx-1 rounded-full ${
                                i < stepIndex ? "bg-primary/40" : "bg-border"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {isCancelled && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  This order has been cancelled.
                </p>
              </div>
            )}

            {/* Order info */}
            <Card className="shadow-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Order #{order.id.toString()}
                  </CardTitle>
                  <AvailabilityBadge availability={order.sellerAvailability} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Placed:{" "}
                  {new Date(
                    Number(order.timestamp / 1_000_000n),
                  ).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Ordered Items
                  </p>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div
                        key={`item-${i}-${item.productType}`}
                        className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50"
                      >
                        <div className="text-sm">
                          <span className="font-medium">
                            {PRODUCT_LABELS[item.productType] ??
                              item.productType}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            — {item.size}
                          </span>
                        </div>
                        <div className="text-sm text-right">
                          <span className="font-semibold">
                            {item.quantity.toString()}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            {item.unitOfMeasurement}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seller reply */}
                {order.sellerAvailability !== null && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Seller Reply
                      </p>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-1">
                          <AvailabilityBadge
                            availability={order.sellerAvailability}
                          />
                          {order.sellerReplyTimestamp && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                Number(order.sellerReplyTimestamp / 1_000_000n),
                              ).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {order.sellerReply && (
                          <p className="text-sm text-foreground mt-2">
                            {order.sellerReply}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {order.sellerAvailability === null && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm">
                      Awaiting seller reply — check back soon.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* CTA back home */}
        <div className="flex items-center justify-between py-2">
          <Link to="/" data-ocid="track.link">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Order Form
            </Button>
          </Link>
        </div>
      </div>

      <TrackFooter />
    </main>
  );
}

function TrackFooter() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);
  return (
    <footer className="bg-nav text-nav-foreground mt-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Separator className="bg-white/10 mb-5" />
        <p className="text-center text-xs text-nav-foreground/50">
          © {year}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-nav-foreground underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
