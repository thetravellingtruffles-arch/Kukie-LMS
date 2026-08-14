"use client";

import * as React from "react";
import { Camera, CameraOff, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface QrScannerProps {
  /** Called with the raw decoded QR text every time a new code is scanned. */
  onScan: (rawValue: string) => void;
  /** Disable scanning momentarily (e.g. while a check-in is being processed). */
  paused?: boolean;
}

/**
 * Camera-based QR scanner using html5-qrcode. Renders into a div by id and
 * drives the library's imperative start/stop lifecycle from React effects.
 * Debounces repeat-scans of the same code so holding a badge in frame
 * doesn't fire the callback on every video frame.
 */
export function QrScanner({ onScan, paused = false }: QrScannerProps) {
  const containerId = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const scannerRef = React.useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [status, setStatus] = React.useState<"idle" | "starting" | "running" | "error" | "unsupported">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const lastScanRef = React.useRef<{ value: string; at: number } | null>(null);
  const onScanRef = React.useRef(onScan);
  onScanRef.current = onScan;

  React.useEffect(() => {
    let cancelled = false;

    async function start() {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setStatus("unsupported");
        return;
      }
      setStatus("starting");
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const instance = new Html5Qrcode(containerId, { verbose: false });
        scannerRef.current = instance;
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            const now = Date.now();
            const last = lastScanRef.current;
            if (last && last.value === decodedText && now - last.at < 4000) return;
            lastScanRef.current = { value: decodedText, at: now };
            onScanRef.current(decodedText);
          },
          () => {
            // per-frame decode failures are expected while no code is in view — ignore
          }
        );
        if (!cancelled) setStatus("running");
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setError(err instanceof Error ? err.message : "Could not access the camera.");
        }
      }
    }

    start();
    return () => {
      cancelled = true;
      const instance = scannerRef.current;
      if (instance) {
        instance.stop().catch(() => {}).finally(() => instance.clear());
      }
      scannerRef.current = null;
    };
  }, [containerId]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-square w-full bg-[#0f1e20]">
          <div id={containerId} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />

          {status !== "running" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-cream/80">
              {status === "starting" && (
                <>
                  <Camera className="size-6 animate-pulse" />
                  <p className="text-xs">Starting camera…</p>
                </>
              )}
              {status === "unsupported" && (
                <>
                  <CameraOff className="size-6" />
                  <p className="px-6 text-xs">Camera scanning isn&apos;t available on this device/browser. Use manual entry below.</p>
                </>
              )}
              {status === "error" && (
                <>
                  <CameraOff className="size-6" />
                  <p className="px-6 text-xs">{error ?? "Camera access was denied."} Use manual entry below.</p>
                </>
              )}
            </div>
          )}

          {status === "running" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative size-[240px]">
                <ScanLine className="absolute inset-x-0 top-1/2 mx-auto size-6 -translate-y-1/2 text-gold/70" />
                <div className="absolute inset-0 rounded-[var(--radius-md)] border-2 border-cream/60" />
              </div>
            </div>
          )}

          {paused && status === "running" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white">
              Processing…
            </div>
          )}
        </div>
        {status === "running" && (
          <div className="flex items-center justify-center gap-1.5 border-t border-border py-2 text-xs text-muted-foreground">
            <ScanLine className="size-3.5" /> Point a staff QR badge at the camera
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ManualCodeEntry({ onSubmit }: { onSubmit: (value: string) => void }) {
  const [value, setValue] = React.useState("");
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        onSubmit(value.trim());
        setValue("");
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Employee number (e.g. EMP-0001)"
        className="h-9 flex-1 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-brand/30"
      />
      <Button type="submit" size="sm">Check In</Button>
    </form>
  );
}
