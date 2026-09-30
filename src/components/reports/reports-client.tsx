"use client";

import * as React from "react";
import { FileText, FileSpreadsheet, FileDown, Presentation, CheckCircle2, Loader2 } from "lucide-react";
import { fetchOrgSnapshot, overallStats, storeSummary } from "@/lib/rollups";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ReportKey = "pdf" | "xlsx" | "csv" | "pptx";

function downloadBlob(data: BlobPart, filename: string, type: string) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsClient() {
  const [busy, setBusy] = React.useState<ReportKey | null>(null);
  const [done, setDone] = React.useState<ReportKey[]>([]);

  async function withData<T>(fn: (data: { snap: Awaited<ReturnType<typeof fetchOrgSnapshot>>; stats: ReturnType<typeof overallStats>; summaries: ReturnType<typeof storeSummary>[] }) => Promise<T>) {
    const snap = await fetchOrgSnapshot();
    const stats = overallStats(snap);
    const summaries = snap.stores.map((s) => storeSummary(snap, s.id));
    return fn({ snap, stats, summaries });
  }

  async function generatePdf() {
    setBusy("pdf");
    try {
      await withData(async ({ stats, summaries }) => {
        const { jsPDF } = await import("jspdf");
        const autoTable = (await import("jspdf-autotable")).default;
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("Kükie Academy — Company Performance Report", 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text("Real, live L&D Tracker data", 14, 27);
        doc.text(new Date().toDateString(), 14, 32);

        doc.setTextColor(0);
        doc.setFontSize(12);
        doc.text("Company Overview", 14, 44);
        autoTable(doc, {
          startY: 48,
          head: [["Metric", "Value"]],
          body: [
            ["Staff Recorded", `${stats.assigned}`],
            ["Certified", `${stats.completed}`],
            ["Compliance", `${stats.compliance.toFixed(1)}%`],
            ["Average Assessment Score", stats.avgQuiz ? `${stats.avgQuiz.toFixed(1)}%` : "—"],
            ["Average Practical Score", stats.avgPractical ? `${stats.avgPractical.toFixed(2)} / 5` : "—"],
            ["Certificates Issued", `${stats.certificates}`],
            ["Attendance Sessions", `${stats.attendanceSessions}`],
          ],
          theme: "grid",
          headStyles: { fillColor: [36, 81, 255] },
        });

        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text("Store Performance", 14, finalY);
        autoTable(doc, {
          startY: finalY + 4,
          head: [["Store", "Format", "Staff", "Compliance", "Quiz Avg", "Practical Avg", "Certs"]],
          body: summaries.map((s) => [
            s.store?.name ?? "—",
            s.store?.format ?? "—",
            `${s.staffList.length}`,
            `${s.compliance.toFixed(0)}%`,
            s.avgQuiz ? `${s.avgQuiz.toFixed(0)}%` : "—",
            s.avgPractical ? s.avgPractical.toFixed(2) : "—",
            `${s.certificates}`,
          ]),
          theme: "striped",
          headStyles: { fillColor: [36, 81, 255] },
          styles: { fontSize: 8 },
        });

        doc.save("KÜKIE-Academy-Company-Report.pdf");
      });
      setDone((d) => [...d, "pdf"]);
    } finally {
      setBusy(null);
    }
  }

  async function generateXlsx() {
    setBusy("xlsx");
    try {
      await withData(async ({ snap, summaries }) => {
        const XLSX = await import("xlsx");
        const wb = XLSX.utils.book_new();

        const empSheet = XLSX.utils.json_to_sheet(
          snap.staff.map((s) => {
            const comps = snap.completions.filter((c) => c.staffId === s.id);
            const certified = comps.some((c) => c.certificateNumber);
            const overdue = !certified && comps.some((c) => c.status === "overdue");
            const status = certified ? "completed" : overdue ? "overdue" : comps.length ? "in-progress" : "not-started";
            return {
              "Employee #": s.employeeNumber,
              Name: s.name,
              Role: s.role ?? "",
              Store: s.storeName ?? "",
              Status: status,
              Courses: comps.length,
            };
          })
        );
        XLSX.utils.book_append_sheet(wb, empSheet, "Employees");

        const storeSheet = XLSX.utils.json_to_sheet(
          summaries.map((s) => ({
            Store: s.store?.name ?? "",
            Code: s.store?.code ?? "",
            Format: s.store?.format ?? "",
            Staff: s.staffList.length,
            "Compliance %": Number(s.compliance.toFixed(1)),
            "Quiz Avg": Number((s.avgQuiz || 0).toFixed(1)),
            "Practical Avg": Number((s.avgPractical || 0).toFixed(2)),
            Certificates: s.certificates,
          }))
        );
        XLSX.utils.book_append_sheet(wb, storeSheet, "Stores");

        const certSheet = XLSX.utils.json_to_sheet(
          snap.completions
            .filter((c) => c.certificateNumber)
            .map((c) => ({
              "Certificate #": c.certificateNumber,
              Employee: c.staff?.name ?? "",
              Course: c.courseTitle ?? c.courseSlug,
              "Issue Date": c.certificateIssuedAt ? new Date(c.certificateIssuedAt).toLocaleDateString() : "",
            }))
        );
        XLSX.utils.book_append_sheet(wb, certSheet, "Certificates");

        XLSX.writeFile(wb, "KÜKIE-Academy-Data-Export.xlsx");
      });
      setDone((d) => [...d, "xlsx"]);
    } finally {
      setBusy(null);
    }
  }

  async function generateCsv() {
    setBusy("csv");
    try {
      await withData(async ({ snap }) => {
        const header = ["Employee Number", "Name", "Role", "Store", "Status", "Courses Tracked"];
        const rows = snap.staff.map((s) => {
          const comps = snap.completions.filter((c) => c.staffId === s.id);
          const certified = comps.some((c) => c.certificateNumber);
          const overdue = !certified && comps.some((c) => c.status === "overdue");
          const status = certified ? "completed" : overdue ? "overdue" : comps.length ? "in-progress" : "not-started";
          return [s.employeeNumber, s.name, s.role ?? "", s.storeName ?? "", status, `${comps.length}`];
        });
        const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
        downloadBlob(csv, "KÜKIE-Academy-Employees.csv", "text/csv");
      });
      setDone((d) => [...d, "csv"]);
    } finally {
      setBusy(null);
    }
  }

  async function generatePptx() {
    setBusy("pptx");
    try {
      await withData(async ({ stats, summaries }) => {
        const PptxGenJS = (await import("pptxgenjs")).default;
        const pptx = new PptxGenJS();
        const brand = "2451FF";
        const row = (cells: string[]) => cells.map((text) => ({ text }));

        const title = pptx.addSlide();
        title.background = { color: "101317" };
        title.addText("Kükie Academy", { x: 0.5, y: 2.2, fontSize: 36, bold: true, color: "FFFFFF" });
        title.addText("Executive Summary — Real L&D Tracker Data", { x: 0.5, y: 2.9, fontSize: 16, color: "9AA0A6" });
        title.addText(new Date().toDateString(), { x: 0.5, y: 3.4, fontSize: 12, color: "6B7280" });

        const kpi = pptx.addSlide();
        kpi.addText("Company Overview", { x: 0.5, y: 0.4, fontSize: 24, bold: true, color: brand });
        kpi.addTable(
          [
            [{ text: "Metric", options: { bold: true, fill: { color: brand }, color: "FFFFFF" } }, { text: "Value", options: { bold: true, fill: { color: brand }, color: "FFFFFF" } }],
            row(["Staff Recorded", `${stats.assigned}`]),
            row(["Compliance", `${stats.compliance.toFixed(1)}%`]),
            row(["Average Assessment Score", stats.avgQuiz ? `${stats.avgQuiz.toFixed(1)}%` : "—"]),
            row(["Average Practical Score", stats.avgPractical ? `${stats.avgPractical.toFixed(2)} / 5` : "—"]),
            row(["Certificates Issued", `${stats.certificates}`]),
          ],
          { x: 0.5, y: 1.1, w: 9, fontSize: 14 }
        );

        const ranking = pptx.addSlide();
        ranking.addText("Store Ranking — Compliance", { x: 0.5, y: 0.4, fontSize: 24, bold: true, color: brand });
        ranking.addTable(
          [
            [{ text: "Store", options: { bold: true, fill: { color: brand }, color: "FFFFFF" } }, { text: "Compliance", options: { bold: true, fill: { color: brand }, color: "FFFFFF" } }],
            ...[...summaries].sort((a, b) => b.compliance - a.compliance).map((s) => row([s.store?.name ?? "—", `${s.compliance.toFixed(0)}%`])),
          ],
          { x: 0.5, y: 1.1, w: 9, fontSize: 12 }
        );

        await pptx.writeFile({ fileName: "KÜKIE-Academy-Executive-Summary.pptx" });
      });
      setDone((d) => [...d, "pptx"]);
    } finally {
      setBusy(null);
    }
  }

  const REPORTS: { key: ReportKey; title: string; desc: string; icon: React.ElementType; action: () => void; accent: string }[] = [
    { key: "pdf", title: "Company Performance Report", desc: "Full PDF with KPIs and store-by-store breakdown", icon: FileText, action: generatePdf, accent: "bg-rose-soft text-rose" },
    { key: "xlsx", title: "Employee & Store Data Export", desc: "Excel workbook — Employees, Stores, Certificates", icon: FileSpreadsheet, action: generateXlsx, accent: "bg-emerald-soft text-emerald" },
    { key: "csv", title: "Employee Data (CSV)", desc: "Flat CSV export for BI tools and spreadsheets", icon: FileDown, action: generateCsv, accent: "bg-brand-soft text-brand" },
    { key: "pptx", title: "Executive Summary Deck", desc: "PowerPoint — overview and store ranking", icon: Presentation, action: generatePptx, accent: "bg-amber-soft text-amber" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {REPORTS.map((r) => (
        <Card key={r.key}>
          <CardHeader>
            <div className={`flex size-10 items-center justify-center rounded-[10px] ${r.accent}`}>
              <r.icon className="size-5" />
            </div>
            <CardTitle className="mt-2">{r.title}</CardTitle>
            <CardDescription>{r.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={r.action} disabled={busy !== null} className="w-full">
              {busy === r.key ? <Loader2 className="size-4 animate-spin" /> : done.includes(r.key) ? <CheckCircle2 className="size-4" /> : null}
              {busy === r.key ? "Generating…" : done.includes(r.key) ? "Downloaded — Generate Again" : "Generate & Download"}
            </Button>
            {done.includes(r.key) && (
              <Badge variant="success" className="mt-3">Last generated just now</Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
