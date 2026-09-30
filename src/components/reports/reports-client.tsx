"use client";

import * as React from "react";
import { FileText, FileSpreadsheet, FileDown, Presentation, CheckCircle2, Loader2 } from "lucide-react";
import { DATA, overallStats, storeSummary, salesImpactSeries } from "@/lib/data";
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
  const stats = overallStats();
  const summaries = DATA.stores.map((s) => storeSummary(s.id));

  async function generatePdf() {
    setBusy("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text("Kükie Academy — Company Performance Report", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text("Module 001 · Sales Build-Up Excellence", 14, 27);
      doc.text(new Date().toDateString(), 14, 32);

      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.text("Company Overview", 14, 44);
      autoTable(doc, {
        startY: 48,
        head: [["Metric", "Value"]],
        body: [
          ["Employees Assigned", `${stats.assigned}`],
          ["Employees Completed", `${stats.completed}`],
          ["Compliance", `${stats.compliance.toFixed(1)}%`],
          ["Average Assessment Score", `${stats.avgQuiz.toFixed(1)}%`],
          ["Average Practical Score", `${stats.avgPractical.toFixed(2)} / 5`],
          ["Certificates Issued", `${stats.certificates}`],
          ["Training Hours", `${stats.trainingHours.toFixed(0)}`],
        ],
        theme: "grid",
        headStyles: { fillColor: [36, 81, 255] },
      });

      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text("Store Performance", 14, finalY);
      autoTable(doc, {
        startY: finalY + 4,
        head: [["Store", "Format", "Employees", "Compliance", "Quiz Avg", "Practical Avg", "Certs"]],
        body: summaries.map((s) => [
          s.store.name,
          s.store.format,
          `${s.employees.length}`,
          `${s.compliance.toFixed(0)}%`,
          `${s.avgQuiz.toFixed(0)}%`,
          s.avgPractical.toFixed(2),
          `${s.certificates}`,
        ]),
        theme: "striped",
        headStyles: { fillColor: [36, 81, 255] },
        styles: { fontSize: 8 },
      });

      doc.save("KÜKIE-Academy-Company-Report.pdf");
      setDone((d) => [...d, "pdf"]);
    } finally {
      setBusy(null);
    }
  }

  async function generateXlsx() {
    setBusy("xlsx");
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      const empSheet = XLSX.utils.json_to_sheet(
        DATA.employees.map((e) => {
          const store = DATA.stores.find((s) => s.id === e.storeId)!;
          return {
            "Employee #": e.employeeNumber,
            Name: e.name,
            Role: e.role,
            Store: store.name,
            Status: e.status,
            "Assigned Date": e.assignedDate,
            "Due Date": e.dueDate,
          };
        })
      );
      XLSX.utils.book_append_sheet(wb, empSheet, "Employees");

      const storeSheet = XLSX.utils.json_to_sheet(
        summaries.map((s) => ({
          Store: s.store.name,
          Code: s.store.code,
          Format: s.store.format,
          Employees: s.employees.length,
          "Compliance %": Number(s.compliance.toFixed(1)),
          "Quiz Avg": Number(s.avgQuiz.toFixed(1)),
          "Practical Avg": Number(s.avgPractical.toFixed(2)),
          Certificates: s.certificates,
        }))
      );
      XLSX.utils.book_append_sheet(wb, storeSheet, "Stores");

      const certSheet = XLSX.utils.json_to_sheet(
        DATA.certificates.map((c) => {
          const emp = DATA.employees.find((e) => e.id === c.employeeId)!;
          return {
            "Certificate #": c.certificateNumber,
            Employee: emp.name,
            "Issue Date": c.issueDate,
          };
        })
      );
      XLSX.utils.book_append_sheet(wb, certSheet, "Certificates");

      XLSX.writeFile(wb, "KÜKIE-Academy-Data-Export.xlsx");
      setDone((d) => [...d, "xlsx"]);
    } finally {
      setBusy(null);
    }
  }

  async function generateCsv() {
    setBusy("csv");
    try {
      const header = ["Employee Number", "Name", "Role", "Store", "Status", "Assigned Date", "Due Date"];
      const rows = DATA.employees.map((e) => {
        const store = DATA.stores.find((s) => s.id === e.storeId)!;
        return [e.employeeNumber, e.name, e.role, store.name, e.status, e.assignedDate, e.dueDate];
      });
      const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
      downloadBlob(csv, "KÜKIE-Academy-Employees.csv", "text/csv");
      setDone((d) => [...d, "csv"]);
    } finally {
      setBusy(null);
    }
  }

  async function generatePptx() {
    setBusy("pptx");
    try {
      const PptxGenJS = (await import("pptxgenjs")).default;
      const pptx = new PptxGenJS();
      const brand = "2451FF";
      const row = (cells: string[]) => cells.map((text) => ({ text }));

      const title = pptx.addSlide();
      title.background = { color: "101317" };
      title.addText("Kükie Academy", { x: 0.5, y: 2.2, fontSize: 36, bold: true, color: "FFFFFF" });
      title.addText("Executive Summary — Module 001 · Sales Build-Up Excellence", { x: 0.5, y: 2.9, fontSize: 16, color: "9AA0A6" });
      title.addText(new Date().toDateString(), { x: 0.5, y: 3.4, fontSize: 12, color: "6B7280" });

      const kpi = pptx.addSlide();
      kpi.addText("Company Overview", { x: 0.5, y: 0.4, fontSize: 24, bold: true, color: brand });
      kpi.addTable(
        [
          [{ text: "Metric", options: { bold: true, fill: { color: brand }, color: "FFFFFF" } }, { text: "Value", options: { bold: true, fill: { color: brand }, color: "FFFFFF" } }],
          row(["Employees Assigned", `${stats.assigned}`]),
          row(["Compliance", `${stats.compliance.toFixed(1)}%`]),
          row(["Average Assessment Score", `${stats.avgQuiz.toFixed(1)}%`]),
          row(["Average Practical Score", `${stats.avgPractical.toFixed(2)} / 5`]),
          row(["Certificates Issued", `${stats.certificates}`]),
        ],
        { x: 0.5, y: 1.1, w: 9, fontSize: 14 }
      );

      const kpiSeries = salesImpactSeries();
      const impact = pptx.addSlide();
      impact.addText("Sales Impact", { x: 0.5, y: 0.4, fontSize: 24, bold: true, color: brand });
      impact.addTable(
        [
          [
            { text: "Period", options: { bold: true, fill: { color: brand }, color: "FFFFFF" } },
            { text: "ATV", options: { bold: true, fill: { color: brand }, color: "FFFFFF" } },
            { text: "IPT", options: { bold: true, fill: { color: brand }, color: "FFFFFF" } },
            { text: "CSAT", options: { bold: true, fill: { color: brand }, color: "FFFFFF" } },
          ],
          ...kpiSeries.map((k) => row([k.label, `$${k.atv.toFixed(2)}`, k.itemsPerTransaction.toFixed(2), `${k.csat.toFixed(1)}%`])),
        ],
        { x: 0.5, y: 1.1, w: 9, fontSize: 14 }
      );

      const ranking = pptx.addSlide();
      ranking.addText("Store Ranking — Compliance", { x: 0.5, y: 0.4, fontSize: 24, bold: true, color: brand });
      ranking.addTable(
        [
          [{ text: "Store", options: { bold: true, fill: { color: brand }, color: "FFFFFF" } }, { text: "Compliance", options: { bold: true, fill: { color: brand }, color: "FFFFFF" } }],
          ...[...summaries].sort((a, b) => b.compliance - a.compliance).map((s) => row([s.store.name, `${s.compliance.toFixed(0)}%`])),
        ],
        { x: 0.5, y: 1.1, w: 9, fontSize: 12 }
      );

      await pptx.writeFile({ fileName: "KÜKIE-Academy-Executive-Summary.pptx" });
      setDone((d) => [...d, "pptx"]);
    } finally {
      setBusy(null);
    }
  }

  const REPORTS: { key: ReportKey; title: string; desc: string; icon: React.ElementType; action: () => void; accent: string }[] = [
    { key: "pdf", title: "Company Performance Report", desc: "Full PDF with KPIs and store-by-store breakdown", icon: FileText, action: generatePdf, accent: "bg-rose-soft text-rose" },
    { key: "xlsx", title: "Employee & Store Data Export", desc: "Excel workbook — Employees, Stores, Certificates", icon: FileSpreadsheet, action: generateXlsx, accent: "bg-emerald-soft text-emerald" },
    { key: "csv", title: "Employee Data (CSV)", desc: "Flat CSV export for BI tools and spreadsheets", icon: FileDown, action: generateCsv, accent: "bg-brand-soft text-brand" },
    { key: "pptx", title: "Executive Summary Deck", desc: "PowerPoint — overview, sales impact, store ranking", icon: Presentation, action: generatePptx, accent: "bg-amber-soft text-amber" },
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
