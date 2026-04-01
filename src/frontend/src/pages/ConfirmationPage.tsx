import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Package, RotateCcw, Search, Zap } from "lucide-react";
import { motion } from "motion/react";
import { CopperProductType } from "../backend.d";
import { useGetOrderConfirmation } from "../hooks/useQueries";

const productLabels: Record<string, string> = {
  [CopperProductType.copperWire]: "Copper Wire",
  [CopperProductType.copperSheet]: "Copper Sheet",
  [CopperProductType.copperPipe]: "Copper Pipe",
  [CopperProductType.copperRod]: "Copper Rod",
};

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

interface Props {
  orderId: bigint;
  onReset: () => void;
}

export default function ConfirmationPage({ orderId, onReset }: Props) {
  const { data: order, isLoading } = useGetOrderConfirmation(orderId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card shadow-xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
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
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ background: "oklch(0.92 0.04 55)" }}
            >
              <CheckCircle2
                className="w-8 h-8"
                style={{ color: "oklch(0.62 0.12 55)" }}
              />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Order Submitted!
            </h1>
            <p className="text-muted-foreground mt-2">
              Your purchase order has been received and is being reviewed.
            </p>

            {/* Prominent Order ID */}
            <div
              className="mt-4 inline-flex flex-col items-center gap-1 px-6 py-3 rounded-xl border-2"
              style={{
                background: "oklch(0.92 0.04 55)",
                borderColor: "oklch(0.62 0.12 55)",
              }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "oklch(0.45 0.1 50)" }}
              >
                Your Order ID — Save This!
              </span>
              <div className="flex items-center gap-2">
                <Package
                  className="w-5 h-5"
                  style={{ color: "oklch(0.62 0.12 55)" }}
                />
                <span
                  className="text-2xl font-bold font-mono"
                  style={{ color: "oklch(0.45 0.1 50)" }}
                >
                  #{orderId.toString()}
                </span>
              </div>
              <span
                className="text-xs"
                style={{ color: "oklch(0.55 0.05 55)" }}
              >
                Use this ID to track your order status
              </span>
            </div>
          </div>

          <Card className="shadow-copper">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3" data-ocid="order.loading_state">
                  {SKELETON_KEYS.map((k) => (
                    <Skeleton key={k} className="h-5 w-full" />
                  ))}
                </div>
              ) : order ? (
                <div className="space-y-4">
                  {/* Contact info */}
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {[
                      { label: "Customer", value: order.customerName },
                      { label: "Company", value: order.companyName },
                      { label: "Email", value: order.email },
                      { label: "Phone", value: order.phoneNumber },
                      {
                        label: "Delivery Date",
                        value: order.requiredDeliveryDate,
                      },
                      {
                        label: "Status",
                        value: (
                          <Badge
                            style={{
                              background: "oklch(0.62 0.12 55)",
                              color: "white",
                            }}
                          >
                            Pending
                          </Badge>
                        ),
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex justify-between items-center py-1.5 border-b border-border last:border-0 col-span-2 sm:col-span-1"
                      >
                        <dt className="text-sm text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="text-sm font-medium text-foreground">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {/* Items table */}
                  <div>
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
                          {(order.items ?? []).map((item, i) => (
                            <TableRow
                              key={`${item.productType}-${item.size}`}
                              data-ocid={`order.item.${i + 1}` as any}
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
                  </div>

                  {order.specialNotes && (
                    <div className="py-2">
                      <dt className="text-sm text-muted-foreground mb-1">
                        Special Notes
                      </dt>
                      <dd className="text-sm text-foreground bg-muted rounded-lg p-3">
                        {order.specialNotes}
                      </dd>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Order details unavailable.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`/track?orderId=${orderId.toString()}`}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-md border border-border bg-card text-sm font-medium hover:bg-accent transition-colors"
              data-ocid="order.secondary_button"
            >
              <Search
                className="w-4 h-4"
                style={{ color: "oklch(0.62 0.12 55)" }}
              />
              Track Your Order
            </a>
            <Button
              onClick={onReset}
              variant="outline"
              className="gap-2"
              data-ocid="order.submit_button"
            >
              <RotateCcw className="w-4 h-4" />
              Submit Another Order
            </Button>
          </div>
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
