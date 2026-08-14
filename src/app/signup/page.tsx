"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KukieLogo } from "@/components/brand/logo";
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // Send the confirmation email link straight back into this app
        // instead of falling back to the shared Supabase project's default
        // Site URL. Requires this exact origin to be added to Supabase's
        // Authentication -> URL Configuration -> Redirect URLs allowlist.
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    // If email confirmation is off, Supabase returns an active session
    // immediately and we can go straight in. If confirmation is required,
    // show a "check your email" state instead.
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setDone(true);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 flex justify-center"><KukieLogo /></div>

        {done ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="size-8 text-emerald" />
            <h1 className="font-display text-xl font-semibold">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to {email}. Confirm your email, then sign in.
            </p>
            <Link href="/login" className="mt-2 text-sm font-medium text-brand hover:underline">Back to sign in</Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              The first account created becomes the workspace Admin. Everyone after that signs up as a Trainer.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="pl-9" autoFocus />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Work email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-9" autoComplete="email" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="pl-9" autoComplete="new-password" />
                </div>
                <p className="text-xs text-muted-foreground">At least 8 characters.</p>
              </div>

              {error && <p className="rounded-[10px] bg-rose-soft px-3 py-2 text-xs font-medium text-rose">{error}</p>}

              <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
                {!loading && <ArrowRight className="size-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Already have an account? <Link href="/login" className="font-medium text-brand hover:underline">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
