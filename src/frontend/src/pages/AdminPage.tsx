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
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  LogOut,
  RefreshCw,
  Save,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CopperProductType,
  OrderStatus,
  type ProductRate,
  type PurchaseOrder,
  SellerAvailability,
} from "../backend";
import { getBackend } from "../backendService";

const ADMIN_EMAIL = "dhairyashah1812@gmail.com";
const ADMIN_PASSWORD = "Copper@1812";

const PRODUCT_LABELS: Record<string, string> = {
  [CopperProductType.copperWire]: "Copper Wire",
  [CopperProductType.copperSheet]: "Copper Sheet",
  [CopperProductType.copperPipe]: "Copper Pipe",
  [CopperProductType.copperRod]: "Copper Rod",
};

const RATE_PRODUCTS: {
  type: CopperProductType;
  label: string;
  defaultRate: string;
}[] = [
  {
    type: CopperProductType.copperWire,
    label: "Copper Wire",
    defaultRate: "850",
  },
  {
    type: CopperProductType.copperSheet,
    label: "Copper Sheet",
    defaultRate: "920",
  },
  {
    type: CopperProductType.copperPipe,
    label: "Copper Pipe",
    defaultRate: "970",
  },
  {
    type: CopperProductType.copperRod,
    label: "Copper Rod",
    defaultRate: "810",
  },
];

function AvailabilityBadge({
  availability,
}: { availability: SellerAvailability | null }) {
  if (!availability) {
    return (
      <Badge variant="secondary" className="text-xs whitespace-nowrap">
        Awaiting Reply
      </Badge>
    );
  }
  if (availability === SellerAvailability.available) {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
        ✓ Available
      </Badge>
    );
  }
  if (availability === SellerAvailability.partial) {
    return (
      <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
        ~ Partial
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
      ✗ Not Available
    </Badge>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg: Record<OrderStatus, { label: string; cls: string }> = {
    [OrderStatus.pending]: {
      label: "Pending",
      cls: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    [OrderStatus.processing]: {
      label: "Processing",
      cls: "bg-blue-100 text-blue-800 border-blue-200",
    },
    [OrderStatus.shipped]: {
      label: "Shipped",
      cls: "bg-purple-100 text-purple-800 border-purple-200",
    },
    [OrderStatus.completed]: {
      label: "Completed",
      cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    [OrderStatus.cancelled]: {
      label: "Cancelled",
      cls: "bg-red-100 text-red-800 border-red-200",
    },
  };
  const c = cfg[status] ?? { label: status, cls: "bg-gray-100 text-gray-800" };
  return <Badge className={`${c.cls} text-xs`}>{c.label}</Badge>;
}

// ────────────────────────────────────────────────────────────
// Login Screen
// ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [emailVal, setEmailVal] = useState("");
  const [passwordVal, setPasswordVal] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    // Simulate brief loading for UX
    setTimeout(() => {
      if (emailVal.trim() === ADMIN_EMAIL && passwordVal === ADMIN_PASSWORD) {
        onLogin();
      } else {
        setError("Invalid email or password. Access denied.");
      }
      setIsLoading(false);
    }, 400);
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-nav text-nav-foreground font-bold text-lg mb-4">
            Cu
          </div>
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-1">
            Admin Dashboard
          </p>
          <h1 className="text-2xl font-bold text-foreground">Seller Login</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access restricted to authorized sellers only.
          </p>
        </div>

        <Card className="shadow-card-md border-border">
          <CardContent className="pt-6">
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              data-ocid="admin.modal"
            >
              <div>
                <Label htmlFor="admin-email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="seller@example.com"
                  value={emailVal}
                  onChange={(e) => setEmailVal(e.target.value)}
                  className="mt-1.5"
                  autoComplete="email"
                  data-ocid="admin.input"
                />
              </div>
              <div>
                <Label htmlFor="admin-password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordVal}
                  onChange={(e) => setPasswordVal(e.target.value)}
                  className="mt-1.5"
                  autoComplete="current-password"
                  data-ocid="admin.input"
                />
              </div>

              {error && (
                <div
                  className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm"
                  data-ocid="admin.error_state"
                >
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 font-semibold"
                data-ocid="admin.submit_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

// ────────────────────────────────────────────────────────────
// Rates Editor
// ────────────────────────────────────────────────────────────
function RatesEditor() {
  const [rateValues, setRateValues] = useState<
    Record<CopperProductType, string>
  >(
    () =>
      Object.fromEntries(
        RATE_PRODUCTS.map((p) => [p.type, p.defaultRate]),
      ) as Record<CopperProductType, string>,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    getBackend()
      .then((b) => b.getProductRates())
      .then((data: ProductRate[]) => {
        const updates: Partial<Record<CopperProductType, string>> = {};
        for (const r of data) {
          if (r.pricePerUnit && Number.parseFloat(r.pricePerUnit) > 0) {
            updates[r.productType as CopperProductType] = r.pricePerUnit;
          }
        }
        if (Object.keys(updates).length > 0) {
          setRateValues((prev) => ({ ...prev, ...updates }));
        }
      })
      .catch(() => {
        // Fall back to defaults
      })
      .finally(() => setIsLoadingRates(false));
  }, []);

  async function handleSaveRates() {
    setIsSaving(true);
    try {
      const b = await getBackend();
      await Promise.all(
        RATE_PRODUCTS.map((p) =>
          b.setProductRate(
            p.type,
            rateValues[p.type] || p.defaultRate,
            "INR",
            "kg",
            "",
          ),
        ),
      );
      const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setLastSaved(now);
      toast.success("Rates saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save rates. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="shadow-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Product Rates (INR/kg)
          </CardTitle>
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Saved at {lastSaved}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Set current prices visible to buyers on the order form.
        </p>
      </CardHeader>
      <CardContent>
        {isLoadingRates ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {RATE_PRODUCTS.map((p) => (
              <div key={p.type}>
                <Label
                  htmlFor={`rate-${p.type}`}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  {p.label}
                </Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id={`rate-${p.type}`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={p.defaultRate}
                    value={rateValues[p.type]}
                    onChange={(e) =>
                      setRateValues((prev) => ({
                        ...prev,
                        [p.type]: e.target.value,
                      }))
                    }
                    className="pl-7"
                    data-ocid="admin.input"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <Button
          onClick={handleSaveRates}
          disabled={isSaving || isLoadingRates}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-teal"
          data-ocid="admin.save_button"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Rates…
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Rates
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────
// Order Row (expandable)
// ────────────────────────────────────────────────────────────
function OrderRow({
  order,
  idx,
  onReply,
}: {
  order: PurchaseOrder;
  idx: number;
  onReply: (
    orderId: bigint,
    availability: SellerAvailability,
    message: string,
  ) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replyMessage, setReplyMessage] = useState(order.sellerReply ?? "");
  const [isReplying, setIsReplying] = useState(false);

  async function handleReply(availability: SellerAvailability) {
    setIsReplying(true);
    try {
      await onReply(order.id, availability, replyMessage);
      toast.success("Reply sent successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send reply.");
    } finally {
      setIsReplying(false);
    }
  }

  const needsReply = order.sellerAvailability === null;

  return (
    <>
      <TableRow
        className={`cursor-pointer hover:bg-muted/50 transition-colors ${needsReply ? "bg-yellow-50/60" : ""}`}
        onClick={() => setExpanded((p) => !p)}
        data-ocid={`admin.row.${idx + 1}`}
      >
        <TableCell className="font-mono text-sm font-semibold">
          #{order.id.toString()}
        </TableCell>
        <TableCell className="text-sm">{order.email}</TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {new Date(Number(order.timestamp / 1_000_000n)).toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            },
          )}
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {order.items.map((item, i) => (
              <Badge
                key={`${item.productType}-${i}`}
                variant="outline"
                className="text-[11px]"
              >
                {PRODUCT_LABELS[item.productType] ?? item.productType} ·{" "}
                {item.size} · {item.quantity.toString()}{" "}
                {item.unitOfMeasurement}
              </Badge>
            ))}
          </div>
        </TableCell>
        <TableCell>
          <OrderStatusBadge status={order.status} />
        </TableCell>
        <TableCell>
          <AvailabilityBadge availability={order.sellerAvailability} />
        </TableCell>
        <TableCell>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/20 px-6 py-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Reply Controls
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Textarea
                  placeholder="Optional reply message to buyer…"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 min-h-[80px] text-sm resize-none"
                  data-ocid="admin.textarea"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex flex-row sm:flex-col gap-2 sm:justify-end">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex-1 sm:flex-none"
                    disabled={isReplying}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReply(SellerAvailability.available);
                    }}
                    data-ocid={`admin.confirm_button.${idx + 1}`}
                  >
                    {isReplying ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    )}
                    Available
                  </Button>
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold flex-1 sm:flex-none"
                    disabled={isReplying}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReply(SellerAvailability.partial);
                    }}
                    data-ocid={`admin.secondary_button.${idx + 1}`}
                  >
                    {isReplying ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <AlertCircle className="w-3 h-3 mr-1" />
                    )}
                    Partial
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold flex-1 sm:flex-none"
                    disabled={isReplying}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReply(SellerAvailability.unavailable);
                    }}
                    data-ocid={`admin.delete_button.${idx + 1}`}
                  >
                    {isReplying ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    Not Available
                  </Button>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────
// Dashboard
// ────────────────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await (await getBackend()).getAllPurchaseOrders();
      // Sort: needs reply first, then by timestamp descending
      const sorted = [...data].sort((a, b) => {
        const aNeeds = a.sellerAvailability === null ? 0 : 1;
        const bNeeds = b.sellerAvailability === null ? 0 : 1;
        if (aNeeds !== bNeeds) return aNeeds - bNeeds;
        return Number(b.timestamp - a.timestamp);
      });
      setOrders(sorted);
      setLastRefreshed(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleReply(
    orderId: bigint,
    availability: SellerAvailability,
    message: string,
  ) {
    await (await getBackend()).replyToOrder(orderId, availability, message);
    await loadOrders();
  }

  const filtered = orders.filter(
    (o) =>
      !searchQuery ||
      o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toString().includes(searchQuery),
  );

  const awaitingCount = orders.filter(
    (o) => o.sellerAvailability === null,
  ).length;

  return (
    <main className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-1">
                Admin Dashboard
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Dashboard Overview
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="gap-2"
              data-ocid="admin.secondary_button"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Rates strip */}
      <RatesStrip />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Rates editor */}
        <RatesEditor />

        {/* Orders card */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">Orders</CardTitle>
                {awaitingCount > 0 && (
                  <Badge
                    className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs font-semibold"
                    data-ocid="admin.card"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {awaitingCount} Awaiting Reply
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or Order ID…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm w-56"
                    data-ocid="admin.search_input"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadOrders}
                  disabled={isLoading}
                  className="gap-1.5"
                  data-ocid="admin.secondary_button"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                {lastRefreshed && (
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    Updated {lastRefreshed}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div
                className="py-16 text-center"
                data-ocid="admin.loading_state"
              >
                <Loader2 className="w-7 h-7 text-primary animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading orders…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center" data-ocid="admin.empty_state">
                <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-1">
                  {searchQuery
                    ? "No orders match your search"
                    : "No orders yet"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try a different search term."
                    : "Orders submitted by buyers will appear here."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground w-24">
                        Order ID
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Email
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground w-28">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Items
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground w-28">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground w-32">
                        Availability
                      </TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((order, idx) => (
                      <OrderRow
                        key={order.id.toString()}
                        order={order}
                        idx={idx}
                        onReply={handleReply}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AdminFooter />
    </main>
  );
}

// Compact rates display strip at top of dashboard
function RatesStrip() {
  const [rates, setRates] = useState<
    Array<{ label: string; rate: string; type: CopperProductType }>
  >([]);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    getBackend()
      .then((b) => b.getProductRates())
      .then((data: ProductRate[]) => {
        const sorted = RATE_PRODUCTS.map((p) => {
          const found = data.find((r) => r.productType === p.type);
          return {
            label: p.label.replace("Copper ", ""),
            rate: found?.pricePerUnit || p.defaultRate,
            type: p.type,
          };
        });
        setRates(sorted);
        const latest = data.reduce(
          (m, r) => (r.updatedAt > m ? r.updatedAt : m),
          0n,
        );
        if (latest > 0n) {
          setUpdatedAt(
            new Date(Number(latest / 1_000_000n)).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          );
        }
      })
      .catch(() => {});
  }, []);

  if (rates.length === 0) return null;

  return (
    <div className="bg-white border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[13px]">
          <span className="font-semibold text-foreground/80">
            Current Copper Rates (INR/kg):
          </span>
          {rates.map((r) => (
            <span key={r.type}>
              <span className="text-muted-foreground">{r.label}:</span>{" "}
              <span className="font-semibold text-foreground">
                ₹{Number.parseFloat(r.rate).toLocaleString()}
              </span>
            </span>
          ))}
          {updatedAt && (
            <span className="ml-auto text-muted-foreground text-xs">
              Updated: {updatedAt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Package({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  );
}

function AdminFooter() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);
  return (
    <footer className="bg-nav text-nav-foreground mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

// ────────────────────────────────────────────────────────────
// Main export
// ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem("admin_logged_in") === "1";
  });

  function handleLogin() {
    sessionStorage.setItem("admin_logged_in", "1");
    setIsLoggedIn(true);
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_logged_in");
    setIsLoggedIn(false);
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}
