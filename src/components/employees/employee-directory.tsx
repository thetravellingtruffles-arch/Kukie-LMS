"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { DATA } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initials } from "@/lib/utils";
import type { EmployeeStatus } from "@/lib/types";

const STATUS_VARIANT: Record<EmployeeStatus, "success" | "warning" | "danger" | "secondary"> = {
  completed: "success",
  "in-progress": "warning",
  overdue: "danger",
  "not-started": "secondary",
};

const STATUS_LABEL: Record<EmployeeStatus, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  overdue: "Overdue",
  "not-started": "Not Started",
};

export function EmployeeDirectory() {
  const [query, setQuery] = React.useState("");
  const [storeId, setStoreId] = React.useState<string>("all");
  const [status, setStatus] = React.useState<string>("all");

  const rows = React.useMemo(() => {
    return DATA.employees
      .filter((e) => (storeId === "all" ? true : e.storeId === storeId))
      .filter((e) => (status === "all" ? true : e.status === status))
      .filter((e) => e.name.toLowerCase().includes(query.toLowerCase()) || e.employeeNumber.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 100);
  }, [query, storeId, status]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search employees…" className="pl-9" />
        </div>
        <Select value={storeId} onValueChange={setStoreId}>
          <SelectTrigger className="w-52"><SelectValue placeholder="All Stores" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {DATA.stores.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
          </SelectContent>
        </Select>
        <p className="ml-auto self-center text-xs text-muted-foreground">
          Showing {rows.length} of {DATA.employees.length.toLocaleString()}
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="p-3.5 font-medium">Employee</th>
                  <th className="p-3.5 font-medium">Role</th>
                  <th className="p-3.5 font-medium">Store</th>
                  <th className="p-3.5 font-medium">Status</th>
                  <th className="p-3.5 font-medium">Assigned</th>
                  <th className="p-3.5 font-medium">Due</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => {
                  const store = DATA.stores.find((s) => s.id === e.storeId)!;
                  return (
                    <tr key={e.id} className="border-b border-border/60 last:border-0 hover:bg-surface-muted/50">
                      <td className="p-3.5">
                        <Link href={`/employees/${e.id}`} className="flex items-center gap-2.5">
                          <Avatar className="size-8">
                            <AvatarFallback>{initials(e.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium hover:text-brand">{e.name}</p>
                            <p className="text-xs text-muted-foreground">{e.employeeNumber}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="p-3.5 text-muted-foreground">{e.role}</td>
                      <td className="p-3.5 text-muted-foreground">{store.code}</td>
                      <td className="p-3.5"><Badge variant={STATUS_VARIANT[e.status]}>{STATUS_LABEL[e.status]}</Badge></td>
                      <td className="p-3.5 text-muted-foreground">{e.assignedDate}</td>
                      <td className="p-3.5 text-muted-foreground">{e.dueDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
