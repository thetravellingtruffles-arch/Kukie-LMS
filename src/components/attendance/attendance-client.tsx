"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { DATA } from "@/lib/data";
import { CheckInPanel } from "./check-in-panel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function AttendanceClient() {
  const [query, setQuery] = React.useState("");

  const rows = React.useMemo(() => {
    return DATA.attendance
      .slice(0, 400)
      .map((a) => {
        const emp = DATA.employees.find((e) => e.id === a.employeeId)!;
        const store = DATA.stores.find((s) => s.id === emp.storeId)!;
        return { ...a, employee: emp, store };
      })
      .filter((r) => r.employee.name.toLowerCase().includes(query.toLowerCase()) || r.store.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 50);
  }, [query]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
      <CheckInPanel courseSlug="module-001" courseTitle="Sales Build-Up Excellence" />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Historical Attendance (sample data)</CardTitle>
            <CardDescription>{rows.length} of {DATA.attendance.length.toLocaleString()} recorded sessions shown</CardDescription>
          </div>
          <div className="relative w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search employee or store…" className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Employee</th>
                  <th className="pb-2 pr-3 font-medium">Store</th>
                  <th className="pb-2 pr-3 font-medium">Date</th>
                  <th className="pb-2 pr-3 font-medium">Method</th>
                  <th className="pb-2 pr-3 font-medium">Check-In</th>
                  <th className="pb-2 pr-3 font-medium">Check-Out</th>
                  <th className="pb-2 pr-3 font-medium">Duration</th>
                  <th className="pb-2 font-medium">Signed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-border/60 text-[13px] last:border-0">
                    <td className="py-2 pr-3 font-medium">{r.employee.name}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.store.code}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.sessionDate}</td>
                    <td className="py-2 pr-3">
                      <Badge variant="secondary">{r.method}</Badge>
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.checkIn}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.checkOut}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.durationMin} min</td>
                    <td className="py-2">
                      {r.employeeSigned && r.trainerSigned ? (
                        <Badge variant="success">Fully signed</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
