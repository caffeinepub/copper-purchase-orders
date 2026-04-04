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
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Loader2,
  PackageCheck,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CopperProductType, type ProductRate } from "../backend";
import { getBackend } from "../backendService";

const PRODUCT_LABELS: Record<CopperProductType, string> = {
  [CopperProductType.copperWire]: "Copper Wire",
  [CopperProductType.copperSheet]: "Copper Sheet",
  [CopperProductType.copperPipe]: "Copper Pipe",
  [CopperProductType.copperRod]: "Copper Rod",
};

const PRODUCT_SIZES: Record<CopperProductType, string[]> = {
  [CopperProductType.copperWire]: [
    "AWG 4",
    "AWG 6",
    "AWG 8",
    "AWG 10",
    "AWG 12",
    "AWG 14",
    "AWG 16",
  ],
  [CopperProductType.copperSheet]: ["0.5mm", "1mm", "2mm", "3mm", "5mm"],
  [CopperProductType.copperPipe]: [
    '1/4"',
    '3/8"',
    '1/2"',
    '3/4"',
    '1"',
    '1.5"',
    '2"',
  ],
  [CopperProductType.copperRod]: [
    "6mm",
    "8mm",
    "10mm",
    "12mm",
    "16mm",
    "20mm",
    "25mm",
  ],
};

const UNITS = ["kg", "metric ton", "piece"];

interface OrderItem {
  id: string;
  productType: CopperProductType;
  size: string;
  quantity: string;
  unit: string;
}

function newItem(): OrderItem {
  return {
    id: crypto.randomUUID(),
    productType: CopperProductType.copperWire,
    size: "",
    quantity: "",
    unit: "kg",
  };
}

const DEFAULT_RATES: Record<CopperProductType, number> = {
  [CopperProductType.copperWire]: 850,
  [CopperProductType.copperSheet]: 920,
  [CopperProductType.copperPipe]: 970,
  [CopperProductType.copperRod]: 810,
};

export default function HomePage() {
  const [email, setEmail] = useState(
    () => sessionStorage.getItem("order_email") ?? "",
  );
  const [emailSubmitted, setEmailSubmitted] = useState(
    () => !!sessionStorage.getItem("order_email"),
  );
  const [emailInput, setEmailInput] = useState("");
  const [items, setItems] = useState<OrderItem[]>([newItem()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<bigint | null>(null);
  const [rates, setRates] =
    useState<Record<CopperProductType, number>>(DEFAULT_RATES);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    getBackend()
      .then((b) => b.getProductRates())
      .then((data: ProductRate[]) => {
        const map: Record<string, number> = {};
        let latestTs = 0n;
        for (const r of data) {
          const price = Number.parseFloat(r.pricePerUnit);
          if (!Number.isNaN(price) && price > 0) {
            map[r.productType] = price;
            if (r.updatedAt > latestTs) latestTs = r.updatedAt;
          }
        }
        setRates(
          (prev) =>
            ({
              ...prev,
              ...Object.fromEntries(
                Object.entries(map).map(([k, v]) => [
                  k as CopperProductType,
                  v,
                ]),
              ),
            }) as Record<CopperProductType, number>,
        );
        if (latestTs > 0n) {
          const d = new Date(Number(latestTs / 1_000_000n));
          setRatesUpdatedAt(
            d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          );
        }
      })
      .catch(() => {
        // Use defaults silently
      })
      .finally(() => setRatesLoading(false));
  }, []);

  function handleEmailGate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = emailInput.trim();
    if (!trimmed || !/^[^@]+@[^@]+\.[^@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    sessionStorage.setItem("order_email", trimmed);
    setEmail(trimmed);
    setEmailSubmitted(true);
  }

  function updateItem(id: string, patch: Partial<OrderItem>) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...patch,
              ...(patch.productType ? { size: "" } : {}),
            }
          : item,
      ),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, newItem()]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    for (const item of items) {
      if (!item.size) {
        toast.error("Please select a size for all products.");
        return;
      }
      const qty = Number.parseInt(item.quantity, 10);
      if (Number.isNaN(qty) || qty <= 0) {
        toast.error("Please enter a valid quantity for all products.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const orderId = await (await getBackend()).submitPurchaseOrder({
        customerName: "",
        email,
        companyName: "",
        phoneNumber: "",
        requiredDeliveryDate: "",
        specialNotes: "",
        items: items.map((item) => ({
          productType: item.productType,
          size: item.size,
          quantity: BigInt(Number.parseInt(item.quantity, 10)),
          unitOfMeasurement: item.unit,
        })),
      });
      setConfirmedOrderId(orderId);
      toast.success("Order submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetOrder() {
    setConfirmedOrderId(null);
    setItems([newItem()]);
    sessionStorage.removeItem("order_email");
    setEmail("");
    setEmailSubmitted(false);
    setEmailInput("");
  }

  // --- Confirmation screen ---
  if (confirmedOrderId !== null) {
    return (
      <main className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-lg mx-auto animate-fade-in">
          <div className="bg-card rounded-xl shadow-card-md border border-border p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-5">
              <PackageCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground mb-6 text-sm">
              Your copper order has been received. Keep your Order ID safe to
              track your order.
            </p>
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Your Order ID
              </p>
              <p
                className="text-3xl font-bold font-mono text-foreground"
                data-ocid="order.success_state"
              >
                #{confirmedOrderId.toString()}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/track" className="flex-1">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  data-ocid="order.primary_button"
                >
                  Track Your Order
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetOrder}
                data-ocid="order.secondary_button"
              >
                Place New Order
              </Button>
            </div>
          </div>
        </div>
        <PageFooter />
      </main>
    );
  }

  // --- Email gate ---
  if (!emailSubmitted) {
    return (
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <div
          className="relative bg-nav py-20 px-4 overflow-hidden"
          style={{
            backgroundImage:
              "url('/assets/generated/copper-hero-bg.dim_1200x800.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-nav/80" />
          <div className="relative max-w-2xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
              Copper Procurement Portal
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-nav-foreground mb-4">
              Order Premium
              <br />
              Copper Materials
            </h1>
            <p className="text-nav-foreground/70 text-base mb-8">
              Wire, sheet, pipe, and rod — get competitive rates and fast
              replies from our sales team.
            </p>
          </div>
        </div>

        {/* Rates strip */}
        <div className="bg-white border-b border-border shadow-xs">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
              <span className="font-semibold text-foreground/80">
                Current Copper Rates (INR/kg):
              </span>
              {ratesLoading ? (
                <span className="text-muted-foreground">Loading rates…</span>
              ) : (
                (
                  [
                    [CopperProductType.copperWire, "Wire"],
                    [CopperProductType.copperSheet, "Sheet"],
                    [CopperProductType.copperPipe, "Pipe"],
                    [CopperProductType.copperRod, "Rod"],
                  ] as [CopperProductType, string][]
                ).map(([type, label]) => (
                  <span key={type} className="text-foreground">
                    <span className="text-muted-foreground">{label}:</span>{" "}
                    <span className="font-semibold">
                      ₹{rates[type]?.toLocaleString()}
                    </span>
                  </span>
                ))
              )}
              {ratesUpdatedAt && (
                <span className="ml-auto text-muted-foreground text-xs">
                  Updated: {ratesUpdatedAt}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Email form */}
        <div className="max-w-md mx-auto px-4 py-14">
          <div className="bg-card rounded-xl shadow-card-md border border-border p-8 animate-fade-in">
            <h2 className="text-xl font-bold text-foreground mb-1">
              Start Your Order
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Enter your email address to access the order form and current
              pricing.
            </p>
            <form onSubmit={handleEmailGate} className="space-y-4">
              <div>
                <Label htmlFor="email-gate" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email-gate"
                  type="email"
                  placeholder="you@company.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="mt-1.5"
                  autoComplete="email"
                  data-ocid="order.input"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-teal"
                data-ocid="order.primary_button"
              >
                Continue to Order Form
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Already placed an order?{" "}
              <Link
                to="/track"
                className="text-primary hover:underline"
                data-ocid="nav.link"
              >
                Track your order
              </Link>
            </p>
          </div>
        </div>
        <PageFooter />
      </main>
    );
  }

  // --- Order form ---
  return (
    <main className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-1">
                Buyer Portal
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Place Your Order
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Ordering as{" "}
                <span className="text-foreground font-medium">{email}</span>{" "}
                <button
                  type="button"
                  onClick={resetOrder}
                  className="text-primary hover:underline text-xs ml-1"
                >
                  (change)
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rates strip */}
      <div className="bg-white border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[13px]">
            <span className="font-semibold text-foreground/80 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              Current Copper Rates (INR/kg):
            </span>
            {ratesLoading ? (
              <span className="text-muted-foreground">Loading rates…</span>
            ) : (
              (
                [
                  [CopperProductType.copperWire, "Wire"],
                  [CopperProductType.copperSheet, "Sheet"],
                  [CopperProductType.copperPipe, "Pipe"],
                  [CopperProductType.copperRod, "Rod"],
                ] as [CopperProductType, string][]
              ).map(([type, label]) => (
                <span key={type}>
                  <span className="text-muted-foreground">{label}:</span>{" "}
                  <span className="font-semibold text-foreground">
                    ₹{rates[type]?.toLocaleString()}
                  </span>
                </span>
              ))
            )}
            {ratesUpdatedAt && (
              <span className="ml-auto text-muted-foreground text-xs">
                Updated: {ratesUpdatedAt}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2">
            <Card className="shadow-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">
                  Multi-Product Copper Order
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add one or more copper products to your order.
                </p>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  data-ocid="order.modal"
                >
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="border border-border rounded-lg p-4 space-y-3 bg-muted/30"
                      data-ocid={`order.item.${idx + 1}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          Item {idx + 1}
                        </p>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove item"
                            data-ocid={`order.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Product type */}
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Product Type
                        </Label>
                        <Select
                          value={item.productType}
                          onValueChange={(v) =>
                            updateItem(item.id, {
                              productType: v as CopperProductType,
                            })
                          }
                        >
                          <SelectTrigger
                            className="mt-1"
                            data-ocid="order.select"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(CopperProductType).map((t) => (
                              <SelectItem key={t} value={t}>
                                {PRODUCT_LABELS[t]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Size */}
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Size
                          </Label>
                          <Select
                            value={item.size}
                            onValueChange={(v) =>
                              updateItem(item.id, { size: v })
                            }
                          >
                            <SelectTrigger
                              className="mt-1"
                              data-ocid="order.select"
                            >
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRODUCT_SIZES[item.productType].map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Unit */}
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Unit
                          </Label>
                          <Select
                            value={item.unit}
                            onValueChange={(v) =>
                              updateItem(item.id, { unit: v })
                            }
                          >
                            <SelectTrigger
                              className="mt-1"
                              data-ocid="order.select"
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
                      </div>

                      {/* Quantity */}
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Quantity
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Enter quantity"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, { quantity: e.target.value })
                          }
                          className="mt-1"
                          data-ocid="order.input"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Add another product */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={addItem}
                    data-ocid="order.secondary_button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Product
                  </Button>

                  <Separator />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-teal h-11 text-base font-semibold"
                    data-ocid="order.submit_button"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting Order…
                      </>
                    ) : (
                      <>
                        Submit Order <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Rates sidebar */}
          <div className="space-y-4">
            <Card className="shadow-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Current Rates
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  INR per kg — updated by seller
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {ratesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-muted animate-pulse rounded-md"
                      />
                    ))}
                  </div>
                ) : (
                  (
                    [
                      [
                        CopperProductType.copperWire,
                        "Copper Wire",
                        "AWG sizes",
                      ],
                      [
                        CopperProductType.copperSheet,
                        "Copper Sheet",
                        "mm thickness",
                      ],
                      [
                        CopperProductType.copperPipe,
                        "Copper Pipe",
                        "inch diameter",
                      ],
                      [
                        CopperProductType.copperRod,
                        "Copper Rod",
                        "mm diameter",
                      ],
                    ] as [CopperProductType, string, string][]
                  ).map(([type, label, hint]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground">{hint}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">
                          ₹{rates[type]?.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">/kg</p>
                      </div>
                    </div>
                  ))
                )}
                {ratesUpdatedAt && (
                  <p className="text-xs text-muted-foreground text-right pt-1">
                    Last updated: {ratesUpdatedAt}
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh Rates
                </Button>
              </CardContent>
            </Card>

            {/* Help card */}
            <Card className="shadow-card border-border bg-accent/30">
              <CardContent className="pt-5 pb-5 text-sm space-y-2">
                <p className="font-semibold text-accent-foreground">
                  How it works
                </p>
                <ol className="space-y-1.5 text-muted-foreground text-xs list-decimal list-inside">
                  <li>Select products, sizes & quantities</li>
                  <li>Submit your order</li>
                  <li>Receive your Order ID</li>
                  <li>Seller reviews and replies with availability</li>
                  <li>Track status on the Track page</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PageFooter />
    </main>
  );
}

function PageFooter() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);
  return (
    <footer className="bg-nav text-nav-foreground mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-primary text-primary-foreground text-xs font-bold">
                Cu
              </span>
              <span className="font-bold text-nav-foreground">
                Copper Orders
              </span>
            </div>
            <p className="text-nav-foreground/60 text-sm">
              Premium copper procurement for industrial buyers.
            </p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Quick Links</p>
            <ul className="space-y-2 text-sm text-nav-foreground/70">
              <li>
                <Link
                  to="/"
                  className="hover:text-nav-foreground transition-colors"
                >
                  Place Order
                </Link>
              </li>
              <li>
                <Link
                  to="/track"
                  className="hover:text-nav-foreground transition-colors"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Products</p>
            <ul className="space-y-2 text-sm text-nav-foreground/70">
              <li>Copper Wire (AWG)</li>
              <li>Copper Sheet</li>
              <li>Copper Pipe</li>
              <li>Copper Rod</li>
            </ul>
          </div>
        </div>
        <Separator className="bg-white/10 mb-6" />
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
