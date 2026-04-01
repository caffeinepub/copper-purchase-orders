import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Package,
  Send,
  ShieldAlert,
  TrendingUp,
  Truck,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  CopperProductType,
  OrderStatus,
  SellerAvailability,
} from "../backend.d";
import type { PurchaseOrder } from "../backend.d";
import {
  useGetAllOrders,
  useGetOrderSummary,
  useGetProductRates,
  useReplyToOrder,
  useSetProductRate,
  useUpdateOrderStatus,
} from "../hooks/useQueries";
import type { ProductRate } from "../hooks/useQueries";

const SELLER_EMAIL = "dhairyashah1812@gmail.com";
const SELLER_PASSWORD = "Copper@1812";

const productLabels: Record<string, string> = {
  [CopperProductType.copperWire]: "Copper Wire",
  [CopperProductType.copperSheet]: "Copper Sheet",
  [CopperProductType.copperPipe]: "Copper Pipe",
  [CopperProductType.copperRod]: "Copper Rod",
};

const statusConfig: Record<
  string,
  { label: string; style: React.CSSProperties }
> = {
  [OrderStatus.pending]: {
    label: "Pending",
    style: { background: "oklch(0.9 0.05 75)", color: "oklch(0.45 0.1 60)" },
  },
  [OrderStatus.processing]: {
    label: "Processing",
    style: { background: "oklch(0.88 0.06 230)", color: "oklch(0.35 0.1 240)" },
  },
  [OrderStatus.shipped]: {
    label: "Shipped",
    style: { background: "oklch(0.88 0.07 160)", color: "oklch(0.35 0.1 150)" },
  },
  [OrderStatus.completed]: {
    label: "Completed",
    style: { background: "oklch(0.88 0.07 145)", color: "oklch(0.3 0.1 140)" },
  },
  [OrderStatus.cancelled]: {
    label: "Cancelled",
    style: { background: "oklch(0.92 0.04 20)", color: "oklch(0.45 0.1 25)" },
  },
};

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

const QUICK_REPLIES: {
  label: string;
  availability: SellerAvailability;
  message: string;
}[] = [
  {
    label: "✅ In Stock",
    availability: SellerAvailability.available,
    message:
      "Great news! The item is in stock. We are confirming your order and will arrange delivery as requested.",
  },
  {
    label: "⚠️ Partial",
    availability: SellerAvailability.partial,
    message:
      "We have partial stock available. Please contact us to discuss how we can fulfil your order.",
  },
  {
    label: "❌ Out of Stock",
    availability: SellerAvailability.unavailable,
    message:
      "Unfortunately this item is currently out of stock. We will notify you when it becomes available.",
  },
];

interface ReplyFormProps {
  order: PurchaseOrder;
  onDone: () => void;
}

function ReplyForm({ order, onDone }: ReplyFormProps) {
  const [availability, setAvailability] = useState<SellerAvailability | "">(
    order.sellerAvailability ?? "",
  );
  const [message, setMessage] = useState(order.sellerReply ?? "");
  const replyToOrder = useReplyToOrder();

  function applyQuickReply(qr: (typeof QUICK_REPLIES)[number]) {
    setAvailability(qr.availability);
    setMessage(qr.message);
  }

  async function handleSend() {
    if (!availability || !message.trim()) {
      toast.error("Please select availability and write a message.");
      return;
    }
    try {
      await replyToOrder.mutateAsync({
        orderId: order.id,
        availability: availability as SellerAvailability,
        replyMessage: message.trim(),
      });
      toast.success("Reply sent to buyer.");
      onDone();
    } catch {
      toast.error("Failed to send reply.");
    }
  }

  return (
    <div className="space-y-3 pt-3">
      <Separator />
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Availability
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyQuickReply(QUICK_REPLIES[0])}
          className="flex-1 min-w-[90px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border-2 text-xs font-bold transition-all"
          style={{
            borderColor:
              availability === SellerAvailability.available
                ? "oklch(0.5 0.14 145)"
                : "oklch(0.75 0.06 145)",
            background:
              availability === SellerAvailability.available
                ? "oklch(0.88 0.07 145)"
                : "transparent",
            color:
              availability === SellerAvailability.available
                ? "oklch(0.3 0.1 140)"
                : "oklch(0.45 0.08 145)",
          }}
          data-ocid="admin.reply.button"
        >
          <CheckCircle2 className="w-4 h-4" /> Available
        </button>
        <button
          type="button"
          onClick={() => applyQuickReply(QUICK_REPLIES[1])}
          className="flex-1 min-w-[90px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border-2 text-xs font-bold transition-all"
          style={{
            borderColor:
              availability === SellerAvailability.partial
                ? "oklch(0.55 0.12 75)"
                : "oklch(0.78 0.06 75)",
            background:
              availability === SellerAvailability.partial
                ? "oklch(0.9 0.05 75)"
                : "transparent",
            color:
              availability === SellerAvailability.partial
                ? "oklch(0.4 0.1 60)"
                : "oklch(0.5 0.08 70)",
          }}
          data-ocid="admin.reply.button"
        >
          <AlertCircle className="w-4 h-4" /> Partial
        </button>
        <button
          type="button"
          onClick={() => applyQuickReply(QUICK_REPLIES[2])}
          className="flex-1 min-w-[90px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border-2 text-xs font-bold transition-all"
          style={{
            borderColor:
              availability === SellerAvailability.unavailable
                ? "oklch(0.52 0.12 25)"
                : "oklch(0.78 0.06 20)",
            background:
              availability === SellerAvailability.unavailable
                ? "oklch(0.92 0.04 20)"
                : "transparent",
            color:
              availability === SellerAvailability.unavailable
                ? "oklch(0.38 0.1 25)"
                : "oklch(0.5 0.08 20)",
          }}
          data-ocid="admin.reply.button"
        >
          <XCircle className="w-4 h-4" /> Not Available
        </button>
      </div>

      <div className="space-y-2">
        <Label>Reply Message</Label>
        <Textarea
          placeholder="e.g. We have 500kg in stock, can deliver by the requested date..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          data-ocid="admin.reply.textarea"
        />
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSend}
          disabled={replyToOrder.isPending}
          className="gap-1.5 font-semibold"
          style={{ background: "oklch(0.62 0.12 55)", color: "white" }}
          data-ocid="admin.reply.submit_button"
        >
          {replyToOrder.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          Send Reply
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDone}
          data-ocid="admin.reply.cancel_button"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function LoginGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 400));
    if (
      email.trim().toLowerCase() === SELLER_EMAIL.toLowerCase() &&
      password === SELLER_PASSWORD
    ) {
      sessionStorage.setItem("sellerAuthenticated", "true");
      onAuthenticated();
    } else {
      setError("Invalid email or password.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: "oklch(0.92 0.04 55)" }}
          >
            <ShieldAlert
              className="w-7 h-7"
              style={{ color: "oklch(0.62 0.12 55)" }}
            />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Seller Portal
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter your credentials to access the admin dashboard.
          </p>
        </div>

        <Card className="shadow-copper">
          <CardContent className="pt-6">
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              data-ocid="admin.modal"
            >
              <div className="space-y-2">
                <Label htmlFor="sellerEmail">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="sellerEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="pl-9"
                    required
                    autoFocus
                    data-ocid="admin.email.input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellerPassword">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="sellerPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="pl-9 pr-10"
                    required
                    data-ocid="admin.password.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  className="text-xs text-destructive flex items-center gap-1"
                  data-ocid="admin.email.error_state"
                >
                  <AlertCircle className="w-3 h-3" /> {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full font-semibold gap-2"
                disabled={loading || !email || !password}
                style={{ background: "oklch(0.62 0.12 55)", color: "white" }}
                data-ocid="admin.primary_button"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Verifying..." : "Access Dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:underline"
            data-ocid="nav.link"
          >
            ← Back to Order Form
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

const PRODUCT_CONFIGS = [
  { type: "copperWire" as const, label: "Copper Wire", icon: "🔌" },
  { type: "copperSheet" as const, label: "Copper Sheet", icon: "📄" },
  { type: "copperPipe" as const, label: "Copper Pipe", icon: "🔧" },
  { type: "copperRod" as const, label: "Copper Rod", icon: "📏" },
];

const CURRENCIES = ["USD", "INR", "EUR", "AED", "GBP"];
const UNITS = ["kg", "ton", "meter", "piece", "roll", "sheet"];

function ProductRatesCard() {
  const { data: rates, isLoading } = useGetProductRates();
  const setRate = useSetProductRate();
  const [editingType, setEditingType] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    pricePerUnit: "",
    currency: "USD",
    unit: "kg",
    notes: "",
  });

  function getRateForProduct(productType: string): ProductRate | undefined {
    return rates?.find((r) => r.productType === productType);
  }

  function startEdit(productType: string) {
    const existing = getRateForProduct(productType);
    setFormState({
      pricePerUnit: existing?.pricePerUnit ?? "",
      currency: existing?.currency ?? "USD",
      unit: existing?.unit ?? "kg",
      notes: existing?.notes ?? "",
    });
    setEditingType(productType);
  }

  async function handleSave(productType: string) {
    const price = formState.pricePerUnit.trim();
    if (!price || Number.isNaN(Number(price)) || Number(price) <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }
    try {
      await setRate.mutateAsync({
        productType: productType as CopperProductType,
        pricePerUnit: price,
        currency: formState.currency,
        unit: formState.unit,
        notes: formState.notes.trim(),
      });
      toast.success("Rate saved.");
      setEditingType(null);
    } catch {
      toast.error("Failed to save rate.");
    }
  }

  function formatUpdatedAt(ts: bigint): string {
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <Card className="shadow-copper mb-8">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: "oklch(0.62 0.12 55)" }}
          >
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div>
            <CardTitle className="font-display text-xl">
              Product Rates
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set pricing that buyers will see before placing orders
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3" data-ocid="admin.rates.loading_state">
            {["sk-r1", "sk-r2", "sk-r3", "sk-r4"].map((k) => (
              <Skeleton key={k} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {PRODUCT_CONFIGS.map(({ type, label, icon }) => {
              const rate = getRateForProduct(type);
              const isEditing = editingType === type;
              return (
                <div
                  key={type}
                  className="rounded-lg border border-border bg-muted/20 overflow-hidden"
                  data-ocid={`admin.rates.${type}.card` as any}
                >
                  <div className="flex items-center justify-between p-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl">{icon}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground">
                          {label}
                        </p>
                        {rate ? (
                          <p className="text-xs text-muted-foreground">
                            <span
                              className="font-bold"
                              style={{ color: "oklch(0.52 0.12 55)" }}
                            >
                              {rate.currency} {rate.pricePerUnit}/{rate.unit}
                            </span>
                            {rate.notes ? ` · ${rate.notes}` : ""}
                            {" · Updated "}
                            {formatUpdatedAt(rate.updatedAt)}
                          </p>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs mt-0.5"
                            style={{
                              color: "oklch(0.55 0.08 55)",
                              borderColor: "oklch(0.75 0.06 55)",
                            }}
                          >
                            Not set
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        isEditing ? setEditingType(null) : startEdit(type)
                      }
                      className="gap-1.5 text-xs shrink-0"
                      data-ocid={`admin.rates.${type}.edit_button` as any}
                    >
                      <Edit2 className="w-3 h-3" />
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-3 pb-3 pt-1 border-t border-border bg-muted/30"
                          style={{ borderTopColor: "oklch(0.88 0.05 55)" }}
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            <div>
                              <Label className="text-xs">Price Per Unit</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="850.00"
                                value={formState.pricePerUnit}
                                onChange={(e) =>
                                  setFormState((p) => ({
                                    ...p,
                                    pricePerUnit: e.target.value,
                                  }))
                                }
                                className="mt-1 h-8 text-sm"
                                data-ocid={
                                  `admin.rates.${type}.price.input` as any
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Currency</Label>
                              <Select
                                value={formState.currency}
                                onValueChange={(v) =>
                                  setFormState((p) => ({ ...p, currency: v }))
                                }
                              >
                                <SelectTrigger
                                  className="mt-1 h-8 text-sm"
                                  data-ocid={
                                    `admin.rates.${type}.currency.select` as any
                                  }
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {CURRENCIES.map((c) => (
                                    <SelectItem key={c} value={c}>
                                      {c}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Unit</Label>
                              <Select
                                value={formState.unit}
                                onValueChange={(v) =>
                                  setFormState((p) => ({ ...p, unit: v }))
                                }
                              >
                                <SelectTrigger
                                  className="mt-1 h-8 text-sm"
                                  data-ocid={
                                    `admin.rates.${type}.unit.select` as any
                                  }
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {UNITS.map((u) => (
                                    <SelectItem key={u} value={u}>
                                      {u}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Notes</Label>
                              <Input
                                placeholder="e.g. bulk discount"
                                value={formState.notes}
                                onChange={(e) =>
                                  setFormState((p) => ({
                                    ...p,
                                    notes: e.target.value,
                                  }))
                                }
                                className="mt-1 h-8 text-sm"
                                data-ocid={
                                  `admin.rates.${type}.notes.input` as any
                                }
                              />
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSave(type)}
                            disabled={setRate.isPending}
                            className="gap-1.5 font-semibold"
                            style={{
                              background: "oklch(0.62 0.12 55)",
                              color: "white",
                            }}
                            data-ocid={`admin.rates.${type}.save_button` as any}
                          >
                            {setRate.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : null}
                            Save Rate
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("sellerAuthenticated") === "true",
  );

  const { data: orders, isLoading: loadingOrders } = useGetAllOrders();
  const { data: summary, isLoading: loadingSummary } = useGetOrderSummary();
  const updateStatus = useUpdateOrderStatus();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);

  async function handleStatusChange(orderId: bigint, status: OrderStatus) {
    setUpdatingId(orderId.toString());
    try {
      await updateStatus.mutateAsync({ orderId, status });
      toast.success("Order status updated.");
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("sellerAuthenticated");
    setAuthenticated(false);
  }

  if (!authenticated) {
    return <LoginGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  const sortedOrders = orders
    ? [...orders].sort((a, b) => {
        const aNoReply = !a.sellerReply ? 0 : 1;
        const bNoReply = !b.sellerReply ? 0 : 1;
        return aNoReply - bNoReply;
      })
    : [];

  const statCards = [
    {
      label: "Total Orders",
      value: summary?.totalOrders,
      icon: Package,
      color: "oklch(0.62 0.12 55)",
    },
    {
      label: "Awaiting Reply",
      value: summary?.awaitingReply,
      icon: MessageSquare,
      color: "oklch(0.58 0.12 60)",
      highlight: true,
    },
    {
      label: "Pending",
      value: summary?.pendingOrders,
      icon: Clock,
      color: "oklch(0.65 0.1 75)",
    },
    {
      label: "Processing",
      value: summary?.processingOrders,
      icon: TrendingUp,
      color: "oklch(0.55 0.1 230)",
    },
    {
      label: "Shipped",
      value: summary?.shippedOrders,
      icon: Truck,
      color: "oklch(0.5 0.1 160)",
    },
    {
      label: "Completed",
      value: summary?.completedOrders,
      icon: CheckCheck,
      color: "oklch(0.45 0.1 145)",
    },
    {
      label: "Cancelled",
      value: summary?.cancelledOrders,
      icon: XCircle,
      color: "oklch(0.5 0.08 20)",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "oklch(0.92 0.04 55)",
                color: "oklch(0.45 0.1 50)",
              }}
            >
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="nav.link"
            >
              ← Customer Portal
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-xs"
              data-ocid="admin.secondary_button"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">
            Order Management
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
            {statCards.map(({ label, value, icon: Icon, color, highlight }) => (
              <Card
                key={label}
                className="text-center"
                style={
                  highlight
                    ? { borderColor: "oklch(0.62 0.12 55)", borderWidth: 2 }
                    : {}
                }
              >
                <CardContent className="pt-5 pb-4">
                  {loadingSummary ? (
                    <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  ) : (
                    <div
                      className="text-2xl font-bold font-display"
                      style={{ color }}
                    >
                      {value?.toString() ?? "0"}
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Icon className="w-3 h-3" style={{ color }} />
                    <span className="text-xs text-muted-foreground">
                      {label}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <ProductRatesCard />

          <Card className="shadow-copper">
            <CardHeader>
              <CardTitle className="font-display text-xl">
                Purchase Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingOrders ? (
                <div
                  className="p-6 space-y-3"
                  data-ocid="admin.orders.loading_state"
                >
                  {SKELETON_KEYS.map((k) => (
                    <Skeleton key={k} className="h-12 w-full" />
                  ))}
                </div>
              ) : !sortedOrders.length ? (
                <div
                  className="p-12 text-center text-muted-foreground"
                  data-ocid="admin.orders.empty_state"
                >
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No purchase orders yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto" data-ocid="admin.orders.table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Delivery</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Update Status</TableHead>
                        <TableHead>Seller Reply</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedOrders.map((order, idx) => {
                        const needsReply = !order.sellerReply;
                        const isReplying = replyingId === order.id.toString();
                        return (
                          <TableRow
                            key={order.id.toString()}
                            data-ocid={`admin.orders.row.${idx + 1}` as any}
                            style={
                              needsReply
                                ? {
                                    borderLeft: "3px solid oklch(0.62 0.12 55)",
                                  }
                                : {}
                            }
                          >
                            <TableCell className="font-mono text-xs">
                              <div>#{order.id.toString()}</div>
                              {needsReply && (
                                <span
                                  className="inline-flex items-center gap-1 text-xs font-semibold mt-1 px-1.5 py-0.5 rounded"
                                  style={{
                                    background: "oklch(0.9 0.05 75)",
                                    color: "oklch(0.45 0.1 60)",
                                  }}
                                >
                                  <AlertCircle className="w-2.5 h-2.5" /> Needs
                                  Reply
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {order.customerName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {order.email}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {order.companyName}
                              </div>
                            </TableCell>
                            <TableCell className="min-w-56">
                              <table className="text-xs w-full">
                                <thead>
                                  <tr className="text-muted-foreground">
                                    <th className="text-left font-medium pb-1 pr-2">
                                      Product
                                    </th>
                                    <th className="text-left font-medium pb-1 pr-2">
                                      Size
                                    </th>
                                    <th className="text-left font-medium pb-1 pr-2">
                                      Qty
                                    </th>
                                    <th className="text-left font-medium pb-1">
                                      Unit
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(order.items ?? []).map((item) => (
                                    <tr
                                      key={`${item.productType}-${item.size}`}
                                      className="border-t border-border/40"
                                    >
                                      <td className="pr-2 py-0.5">
                                        {productLabels[item.productType] ??
                                          item.productType}
                                      </td>
                                      <td
                                        className="pr-2 py-0.5 font-medium"
                                        style={{ color: "oklch(0.55 0.1 55)" }}
                                      >
                                        {item.size}
                                      </td>
                                      <td className="pr-2 py-0.5">
                                        {item.quantity.toString()}
                                      </td>
                                      <td className="py-0.5">
                                        {item.unitOfMeasurement}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </TableCell>
                            <TableCell>{order.requiredDeliveryDate}</TableCell>
                            <TableCell>
                              <Badge style={statusConfig[order.status]?.style}>
                                {statusConfig[order.status]?.label ||
                                  order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {updatingId === order.id.toString() ? (
                                <Loader2
                                  className="w-4 h-4 animate-spin"
                                  style={{ color: "oklch(0.62 0.12 55)" }}
                                />
                              ) : (
                                <Select
                                  value={order.status}
                                  onValueChange={(v) =>
                                    handleStatusChange(
                                      order.id,
                                      v as OrderStatus,
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    className="h-8 w-36"
                                    data-ocid={
                                      `admin.orders.status.select.${idx + 1}` as any
                                    }
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={OrderStatus.pending}>
                                      Pending
                                    </SelectItem>
                                    <SelectItem value={OrderStatus.processing}>
                                      Processing
                                    </SelectItem>
                                    <SelectItem value={OrderStatus.shipped}>
                                      Shipped
                                    </SelectItem>
                                    <SelectItem value={OrderStatus.completed}>
                                      Completed
                                    </SelectItem>
                                    <SelectItem value={OrderStatus.cancelled}>
                                      Cancelled
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                            <TableCell className="min-w-64">
                              <AnimatePresence mode="wait">
                                {isReplying ? (
                                  <motion.div
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                  >
                                    <ReplyForm
                                      order={order}
                                      onDone={() => setReplyingId(null)}
                                    />
                                  </motion.div>
                                ) : order.sellerReply ? (
                                  <motion.div
                                    key="sent"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-2"
                                  >
                                    {order.sellerAvailability ===
                                      SellerAvailability.available && (
                                      <span
                                        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                                        style={{
                                          background: "oklch(0.88 0.07 145)",
                                          color: "oklch(0.3 0.1 140)",
                                        }}
                                      >
                                        <CheckCircle2 className="w-3 h-3" />{" "}
                                        Available
                                      </span>
                                    )}
                                    {order.sellerAvailability ===
                                      SellerAvailability.partial && (
                                      <span
                                        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                                        style={{
                                          background: "oklch(0.9 0.05 75)",
                                          color: "oklch(0.45 0.1 60)",
                                        }}
                                      >
                                        <AlertCircle className="w-3 h-3" />{" "}
                                        Partial
                                      </span>
                                    )}
                                    {order.sellerAvailability ===
                                      SellerAvailability.unavailable && (
                                      <span
                                        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                                        style={{
                                          background: "oklch(0.92 0.04 20)",
                                          color: "oklch(0.45 0.1 25)",
                                        }}
                                      >
                                        <XCircle className="w-3 h-3" />{" "}
                                        Unavailable
                                      </span>
                                    )}
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {order.sellerReply}
                                    </p>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs gap-1"
                                      onClick={() =>
                                        setReplyingId(order.id.toString())
                                      }
                                      data-ocid={
                                        `admin.orders.edit_button.${idx + 1}` as any
                                      }
                                    >
                                      <Edit2 className="w-3 h-3" /> Edit Reply
                                    </Button>
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="none"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                  >
                                    <Button
                                      size="sm"
                                      className="h-8 text-xs gap-1.5 font-semibold"
                                      style={{
                                        background: "oklch(0.62 0.12 55)",
                                        color: "white",
                                      }}
                                      onClick={() =>
                                        setReplyingId(order.id.toString())
                                      }
                                      data-ocid={
                                        `admin.orders.button.${idx + 1}` as any
                                      }
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />{" "}
                                      Reply to Order
                                    </Button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
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
