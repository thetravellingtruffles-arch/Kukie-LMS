"use client";

import { QRCodeSVG } from "qrcode.react";
import { KukieMark } from "@/components/brand/logo";
import type { Staff } from "@/lib/types";

export function staffQrValue(staff: Pick<Staff, "employeeNumber">) {
  return `KUKIE-STAFF:${staff.employeeNumber}`;
}

export function StaffBadge({ staff, size = 180 }: { staff: Staff; size?: number }) {
  return (
    <div className="flex w-fit flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-white p-5 text-[#183135]">
      <KukieMark className="size-8" />
      <QRCodeSVG value={staffQrValue(staff)} size={size} />
      <div className="text-center">
        <p className="font-display text-sm font-semibold">{staff.name}</p>
        <p className="font-mono text-xs tracking-wider text-[#183135]/70">{staff.employeeNumber}</p>
        {staff.role && <p className="text-[11px] text-[#183135]/60">{staff.role}</p>}
      </div>
    </div>
  );
}
