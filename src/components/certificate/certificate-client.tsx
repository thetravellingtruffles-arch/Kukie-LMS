"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Search, ShieldCheck } from "lucide-react";
import { DATA } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { KukieWordmark } from "@/components/brand/logo";

export function CertificateClient() {
  const certified = React.useMemo(
    () => DATA.certificates.map((c) => ({ cert: c, emp: DATA.employees.find((e) => e.id === c.employeeId)! })),
    []
  );
  const [certId, setCertId] = React.useState(certified[0]?.cert.employeeId);
  const [query, setQuery] = React.useState("");
  const current = certified.find((c) => c.cert.employeeId === certId) ?? certified[0];
  const store = DATA.stores.find((s) => s.id === current.emp.storeId)!;
  const trainer = DATA.trainers.find((t) => t.id === current.cert.trainerId)!;

  const filtered = certified.filter(
    (c) => c.emp.name.toLowerCase().includes(query.toLowerCase()) || c.cert.certificateNumber.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Select value={current.cert.employeeId} onValueChange={setCertId}>
            <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
            <SelectContent>
              {certified.slice(0, 150).map((c) => (
                <SelectItem key={c.cert.employeeId} value={c.cert.employeeId}>{c.emp.name} — {c.cert.certificateNumber}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" /> Print / Save as PDF
          </Button>
        </div>

        {/* Certificate — matches the brand manual's formal cover treatment */}
        <div className="relative overflow-hidden rounded-[10px] border border-[#183135] bg-[#183135] p-10 text-[#ede8e4] sm:p-14">
          <div className="grid-fade pointer-events-none absolute inset-0 opacity-[0.06]" />

          <div className="relative z-10 flex items-start justify-between">
            <KukieWordmark />
            <p className="max-w-[200px] text-right text-[9px] leading-relaxed text-white/40">
              Confidential &amp; Internal Use Only. Property of Kükie Pro.
            </p>
          </div>

          <div className="relative z-10 mt-14 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50">
              Module 001 · Sales Build-Up Excellence
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
              Certificate of Completion
            </h2>

            <p className="mt-9 text-xs italic text-white/50">This certifies that</p>
            <p className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">{current.emp.name}</p>
            <p className="mt-2 text-sm text-white/60">{current.emp.role} · {store.name}</p>

            <p className="mx-auto mt-6 max-w-md text-sm text-white/50">
              has successfully completed all requirements of Module 001 — Sales Build-Up Excellence,
              including the Knowledge Assessment, Practical Assessment and Role Play evaluation.
            </p>

            <div className="mx-auto mt-10 grid w-full max-w-lg grid-cols-3 gap-4 border-t border-white/20 pt-6 text-left">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">Certificate No.</p>
                <p className="mt-0.5 font-mono text-xs font-semibold">{current.cert.certificateNumber}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">Issue Date</p>
                <p className="mt-0.5 text-xs font-semibold">{current.cert.issueDate}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">Trainer</p>
                <p className="mt-0.5 text-xs font-semibold">{trainer.name}</p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="rounded-[6px] bg-white p-2">
                <QRCodeSVG value={`https://kukie.ai/academy/verify/${current.cert.qrToken}`} size={64} />
              </div>
              <p className="max-w-[160px] text-left text-[10px] text-white/40">
                Scan to verify this certificate at kukie.ai/academy/verify
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-10 flex items-center justify-between border-t border-white/20 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
            <span>Version 1.0 · Module 001</span>
            <span>Kükie Academy 2026</span>
          </div>
        </div>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Certificate Registry</CardTitle>
          <CardDescription>{DATA.certificates.length.toLocaleString()} issued company-wide</CardDescription>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or certificate #…" className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex max-h-[560px] flex-col divide-y divide-border overflow-y-auto">
            {filtered.slice(0, 60).map((c) => (
              <button
                key={c.cert.employeeId}
                onClick={() => setCertId(c.cert.employeeId)}
                className="flex items-center justify-between gap-2 py-2.5 text-left first:pt-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.emp.name}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">{c.cert.certificateNumber}</p>
                </div>
                <Badge variant="success" className="shrink-0"><ShieldCheck className="size-3" /> Verified</Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
