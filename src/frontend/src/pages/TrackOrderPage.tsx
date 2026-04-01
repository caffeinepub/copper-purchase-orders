import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  Search,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  CopperProductType,
  type PurchaseOrder,
  SellerAvailability,
} from "../backend.d";
import { useTrackOrder } from "../hooks/useQueries";

const productLabels: Record<string, string> = {
  [CopperProductType.copperWire]: "Copper Wire",
  [CopperProductType.copperSheet]: "Copper Sheet",
  [CopperProductType.copperPipe]: "Copper Pipe",
  [CopperProductType.copperRod]: "Copper Rod",
};

function AvailabilityBadge({
  availability,
}: { availability: SellerAvailability | null }) {
  if (!availability) return null;
  if (availability === SellerAvailability.available) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
        style={{
          background: "oklch(0.88 0.07 145)",
          color: "oklch(0.3 0.1 140)",
        }}
      >
        <CheckCircle2 className="w-4 h-4" /> Available
      </span>
    );
  }
  if (availability === SellerAvailability.partial) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
        style={{
          background: "oklch(0.9 0.05 75)",
          color: "oklch(0.45 0.1 60)",
        }}
      >
        <AlertCircle className="w-4 h-4" /> Partial Stock
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
      style={{ background: "oklch(0.92 0.04 20)", color: "oklch(0.45 0.1 25)" }}
    >
      <XCircle className="w-4 h-4" /> Not Available
    </span>
  );
}

export default function TrackOrderPage() {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<
    PurchaseOrder | null | undefined
  >(undefined);
  const trackOrder = useTrackOrder();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("orderId");
    if (id) setOrderIdInput(id);
  }, []);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    const id = BigInt(orderIdInput.trim());
    const result = await trackOrder.mutateAsync({
      orderId: id,
      email: emailInput.trim(),
    });
    setTrackedOrder(result ?? null);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card shadow-xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: "oklch(0.62 0.12 55)" }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-foreground">
              Copper Orders
            </span>
          </div>
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.link"
          >
            ← Place an Order
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
              style={{ background: "oklch(0.92 0.04 55)" }}
            >
              <Search
                className="w-6 h-6"
                style={{ color: "oklch(0.62 0.12 55)" }}
              />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Track Your Order
            </h1>
            <p className="text-muted-foreground mt-2">
              Enter your Order ID and email address to check your order status.
            </p>
          </div>

          <Card className="shadow-copper">
            <CardContent className="pt-6">
              <form onSubmit={handleTrack} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    type="number"
                    placeholder="e.g. 1001"
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                    required
                    min="1"
                    data-ocid="track.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trackEmail">Email Address</Label>
                  <Input
                    id="trackEmail"
                    type="email"
                    placeholder="The email used when ordering"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    data-ocid="track.search_input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gap-2 font-semibold"
                  style={{ background: "oklch(0.62 0.12 55)", color: "white" }}
                  disabled={
                    trackOrder.isPending || !orderIdInput || !emailInput
                  }
                  data-ocid="track.submit_button"
                >
                  {trackOrder.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  {trackOrder.isPending ? "Searching..." : "Track Order"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <AnimatePresence mode="wait">
            {trackOrder.isError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4"
                data-ocid="track.error_state"
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Something went wrong. Please try again.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {trackedOrder === null && (
              <motion.div
                key="not-found"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4"
                data-ocid="track.error_state"
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Order not found. Please check your Order ID and email
                    address.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {trackedOrder && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 space-y-4"
                data-ocid="track.success_state"
              >
                {/* Seller Reply Status */}
                {trackedOrder.sellerReply ? (
                  <Card
                    className="border-2"
                    style={{
                      borderColor:
                        trackedOrder.sellerAvailability ===
                        SellerAvailability.available
                          ? "oklch(0.6 0.1 145)"
                          : trackedOrder.sellerAvailability ===
                              SellerAvailability.partial
                            ? "oklch(0.65 0.1 75)"
                            : "oklch(0.55 0.1 25)",
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="font-display text-lg flex items-center gap-2">
                        Seller Response
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <AvailabilityBadge
                          availability={trackedOrder.sellerAvailability}
                        />
                      </div>
                      <p className="text-sm text-foreground bg-muted rounded-lg p-3">
                        {trackedOrder.sellerReply}
                      </p>
                      {trackedOrder.sellerReplyTimestamp && (
                        <p className="text-xs text-muted-foreground">
                          Replied{" "}
                          {new Date(
                            Number(trackedOrder.sellerReplyTimestamp) /
                              1_000_000,
                          ).toLocaleString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card
                    className="border-2"
                    style={{ borderColor: "oklch(0.88 0.025 60)" }}
                  >
                    <CardContent
                      className="pt-6 pb-6 text-center"
                      data-ocid="track.loading_state"
                    >
                      <div
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                        style={{ background: "oklch(0.92 0.04 55)" }}
                      >
                        <Clock
                          className="w-6 h-6"
                          style={{ color: "oklch(0.62 0.12 55)" }}
                        />
                      </div>
                      <h3 className="font-display font-semibold text-foreground mb-1">
                        Under Review
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Your order is being reviewed by our team. We'll confirm
                        availability soon.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Order Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <Package
                        className="w-4 h-4"
                        style={{ color: "oklch(0.62 0.12 55)" }}
                      />
                      Order #{trackedOrder.id.toString()}
                      <Badge
                        className="ml-auto"
                        style={{
                          background: "oklch(0.62 0.12 55)",
                          color: "white",
                        }}
                      >
                        {trackedOrder.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Separator className="mb-3" />
                    <dl className="space-y-2 mb-4">
                      {[
                        { label: "Customer", value: trackedOrder.customerName },
                        { label: "Company", value: trackedOrder.companyName },
                        {
                          label: "Delivery Date",
                          value: trackedOrder.requiredDeliveryDate,
                        },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex justify-between items-center text-sm"
                        >
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd className="font-medium text-foreground">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    {/* Items table */}
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Ordered Items
                    </p>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(trackedOrder.items ?? []).map((item, i) => (
                            <TableRow
                              key={`${item.productType}-${item.size}`}
                              data-ocid={`track.item.${i + 1}` as any}
                            >
                              <TableCell className="font-medium">
                                {productLabels[item.productType] ??
                                  item.productType}
                              </TableCell>
                              <TableCell
                                style={{ color: "oklch(0.55 0.1 55)" }}
                              >
                                {item.size}
                              </TableCell>
                              <TableCell>{item.quantity.toString()}</TableCell>
                              <TableCell>{item.unitOfMeasurement}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
          style={{ color: "oklch(0.62 0.12 55)" }}
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
