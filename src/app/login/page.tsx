"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldCheck, TrendingUp, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { KukieLogo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { overallStats } from "@/lib/data";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const stats = overallStats();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message === "Invalid login credentials" ? "Incorrect email or password." : signInError.message);
      setLoading(false);
      return;
    }
    const next = searchParams.get("next");
    router.push(next && next.startsWith("/") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-white lg:flex">
        <div className="grid-fade pointer-events-none absolute inset-0 opacity-[0.08]" />
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-0 size-96 rounded-full bg-white/5 blur-3xl" />

        <KukieLogo dark className="relative z-10" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md"
        >
          <p className="font-display text-3xl font-semibold leading-tight">
            Sales Build-Up Excellence
          </p>
          <p className="mt-3 text-sm text-white/60">
            Module 001 of the Kükie Academy — the sales performance improvement platform for
            restaurant, café, QSR and hotel teams.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            <StatChip icon={Users2} value={`${stats.assigned}`} label="Employees" />
            <StatChip icon={ShieldCheck} value={`${stats.compliance.toFixed(0)}%`} label="Compliance" />
            <StatChip icon={TrendingUp} value="+8.4%" label="ATV Lift" />
          </div>
        </motion.div>

        <p className="relative z-10 text-xs text-white/40">
          © 2026 Kükie Academy. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-16">
        <div className="mb-10 flex items-center justify-between lg:hidden">
          <KukieLogo />
        </div>
        <div className="mb-6 flex items-center justify-end">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-sm"
        >
          <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to continue your Kükie Academy training and coaching workspace.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-9" autoComplete="email" autoFocus />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-9" autoComplete="current-password" />
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
              <Checkbox defaultChecked />
              Remember me on this device
            </label>

            {error && <p className="rounded-[10px] bg-rose-soft px-3 py-2 text-xs font-medium text-rose">{error}</p>}

            <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Protected workspace · Kükie Academy Sales Performance Platform
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            No account yet? <Link href="/signup" className="font-medium text-brand hover:underline">Create the first admin account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function StatChip({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-[12px] border border-white/10 bg-white/[0.04] p-3">
      <Icon className="size-4 text-white/60" />
      <p className="mt-2 font-display text-lg font-semibold">{value}</p>
      <p className="text-[11px] text-white/50">{label}</p>
    </div>
  );
}
