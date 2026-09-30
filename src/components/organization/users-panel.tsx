"use client";

import * as React from "react";
import { Loader2, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import {
  fetchAllUsers,
  fetchUserBrandAccess,
  fetchUserAreaAccess,
  setUserRole,
  setUserBrandAccess,
  setUserAreaAccess,
  type UserProfileRow,
} from "@/lib/access/queries";
import type { Brand, OrgRegion } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin", desc: "Builds & manages modules only. No performance/compliance reporting access." },
  { value: "vp", label: "VP", desc: "Full operations & reports — every brand, every store." },
  { value: "operations", label: "Operations", desc: "Full view of their assigned brand(s) — every store under it." },
  { value: "area_manager", label: "Area Manager", desc: "View of their assigned region(s)/area(s) only." },
  { value: "studio_editor", label: "Studio Editor", desc: "Builds & manages modules only, like Admin, without user/brand management." },
  { value: "trainer", label: "Trainer", desc: "No dashboard access — kiosk/training-record use only." },
];

function roleLabel(role: string | null) {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? (role ?? "— none —");
}

export function UsersPanel({ brands, regions }: { brands: Brand[]; regions: OrgRegion[] }) {
  const [users, setUsers] = React.useState<UserProfileRow[] | null>(null);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const refresh = React.useCallback(() => {
    fetchAllUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <Card>
      <CardContent className="p-5">
        <p className="mb-4 text-xs text-muted-foreground">
          Every signed-in user appears here once they log in. Role controls what they can see: Admin/Studio Editor can only
          build modules — no performance or compliance data. VP sees every brand and store. Operations sees only their
          assigned brand(s). Area Manager sees only their assigned region(s). Access is enforced on every dashboard and
          report, not just hidden in the menu.
        </p>
        {users === null ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading users…
          </div>
        ) : users.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No users have logged in yet.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                brands={brands}
                regions={regions}
                expanded={expanded === u.id}
                onToggle={() => setExpanded(expanded === u.id ? null : u.id)}
                onChanged={refresh}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function UserRow({
  user,
  brands,
  regions,
  expanded,
  onToggle,
  onChanged,
}: {
  user: UserProfileRow;
  brands: Brand[];
  regions: OrgRegion[];
  expanded: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const [role, setRole] = React.useState(user.role ?? "trainer");
  const [savingRole, setSavingRole] = React.useState(false);
  const [brandIds, setBrandIds] = React.useState<string[] | null>(null);
  const [regionIds, setRegionIds] = React.useState<string[] | null>(null);
  const [savingScope, setSavingScope] = React.useState(false);

  React.useEffect(() => {
    if (!expanded) return;
    if (role === "operations" && brandIds === null) {
      fetchUserBrandAccess(user.id).then((rows) => setBrandIds(rows.map((r) => r.brandId)));
    }
    if (role === "area_manager" && regionIds === null) {
      fetchUserAreaAccess(user.id).then((rows) => setRegionIds(rows.map((r) => r.regionId)));
    }
  }, [expanded, role, brandIds, regionIds, user.id]);

  async function changeRole(next: string) {
    setSavingRole(true);
    try {
      await setUserRole(user.id, next);
      setRole(next);
      onChanged();
    } finally {
      setSavingRole(false);
    }
  }

  async function saveBrandAccess(ids: string[]) {
    setBrandIds(ids);
    setSavingScope(true);
    try {
      await setUserBrandAccess(user.id, ids);
    } finally {
      setSavingScope(false);
    }
  }

  async function saveAreaAccess(ids: string[]) {
    setRegionIds(ids);
    setSavingScope(true);
    try {
      await setUserAreaAccess(user.id, ids);
    } finally {
      setSavingScope(false);
    }
  }

  const needsScope = role === "operations" || role === "area_manager";

  return (
    <li className="rounded-[10px] bg-surface-muted">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <ShieldCheck className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-medium">{user.email}</span>
          <Badge variant={role === "admin" || role === "vp" ? "success" : "secondary"}>{roleLabel(role)}</Badge>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Select value={role} onValueChange={changeRole} disabled={savingRole}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {needsScope && (
            <Button variant="ghost" size="sm" onClick={onToggle}>
              {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              Scope
            </Button>
          )}
        </div>
      </div>

      {expanded && needsScope && (
        <div className="border-t border-border/60 px-3 py-3">
          {role === "operations" && (
            <>
              <p className="mb-2 text-xs text-muted-foreground">Brand(s) this Operations user can view:</p>
              {brandIds === null ? (
                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
              ) : brands.length === 0 ? (
                <p className="text-xs text-muted-foreground">No brands created yet — add one on the Brands tab.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {brands.map((b) => (
                    <label key={b.id} className="flex items-center gap-1.5 text-sm">
                      <Checkbox
                        checked={brandIds.includes(b.id)}
                        onCheckedChange={(v) => {
                          const next = v ? [...brandIds, b.id] : brandIds.filter((id) => id !== b.id);
                          saveBrandAccess(next);
                        }}
                      />
                      {b.name}
                    </label>
                  ))}
                </div>
              )}
            </>
          )}
          {role === "area_manager" && (
            <>
              <p className="mb-2 text-xs text-muted-foreground">Region(s)/area(s) this Area Manager can view:</p>
              {regionIds === null ? (
                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
              ) : regions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No regions created yet — add one on the Regions tab.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {regions.map((r) => (
                    <label key={r.id} className="flex items-center gap-1.5 text-sm">
                      <Checkbox
                        checked={regionIds.includes(r.id)}
                        onCheckedChange={(v) => {
                          const next = v ? [...regionIds, r.id] : regionIds.filter((id) => id !== r.id);
                          saveAreaAccess(next);
                        }}
                      />
                      {r.name}
                    </label>
                  ))}
                </div>
              )}
            </>
          )}
          {savingScope && <p className="mt-2 text-xs text-muted-foreground">Saving…</p>}
        </div>
      )}
    </li>
  );
}
