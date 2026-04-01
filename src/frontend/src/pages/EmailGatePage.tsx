import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface Props {
  onEmailSubmit: (email: string) => void;
}

export default function EmailGatePage({ onEmailSubmit }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function validateAndSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    onEmailSubmit(trimmed);
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: hero */}
      <div
        className="relative flex-1 min-h-[40vh] lg:min-h-screen flex flex-col justify-between p-8 lg:p-12 overflow-hidden"
        style={{
          background: "oklch(0.22 0.04 50)",
        }}
      >
        <img
          src="/assets/generated/copper-hero-bg.dim_1200x800.jpg"
          alt="Copper background"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.62 0.12 55)" }}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span
              className="font-display text-xl font-semibold"
              style={{ color: "oklch(0.95 0.02 70)" }}
            >
              Copper Orders
            </span>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10"
        >
          <h1
            className="font-display text-4xl lg:text-6xl font-bold leading-tight mb-4"
            style={{ color: "oklch(0.95 0.02 70)" }}
          >
            Industrial Copper,
            <br />
            <span style={{ color: "oklch(0.75 0.1 60)" }}>Delivered.</span>
          </h1>
          <p
            className="text-lg max-w-sm"
            style={{ color: "oklch(0.72 0.02 60)" }}
          >
            Premium copper materials for industry professionals. Place your
            purchase order in minutes.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {["Copper Wire", "Copper Sheet", "Copper Pipe", "Copper Rod"].map(
              (product) => (
                <div key={product} className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "oklch(0.62 0.12 55)" }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: "oklch(0.7 0.02 60)" }}
                  >
                    {product}
                  </span>
                </div>
              ),
            )}
          </div>
        </motion.div>
        <div className="relative z-10" />
      </div>

      {/* Right: form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              Get Started
            </h2>
            <p className="text-muted-foreground">
              Enter your email to place a purchase order.
            </p>
          </div>

          <form onSubmit={validateAndSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoComplete="email"
                  data-ocid="email.input"
                />
              </div>
              {error && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="email.error_state"
                >
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full font-semibold gap-2"
              style={{ background: "oklch(0.62 0.12 55)", color: "white" }}
              data-ocid="email.primary_button"
            >
              Continue to Order Form
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Are you an admin?{" "}
              <Link
                to="/admin"
                className="font-medium hover:underline"
                style={{ color: "oklch(0.62 0.12 55)" }}
                data-ocid="nav.link"
              >
                Go to Admin Panel
              </Link>
            </p>
          </div>
        </motion.div>

        <footer className="mt-auto pt-12 text-center text-xs text-muted-foreground">
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
    </div>
  );
}
