"use client";

import * as React from "react";
import { Loader2, Plus, Trash2, Map, Store, Users2, IdCard } from "lucide-react";
import {
  fetchRegions, createRegion, deleteRegion,
  fetchStores, createStore, deleteStore,
  fetchTrainers, createTrainer, deleteTrainer,
  fetchManagers, createManager, deleteManager,
} from "@/lib/org/queries";
import type { OrgRegion, OrgStore, OrgTrainer, OrgManager } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function OrganizationClient() {
  const [regions, setRegions] = React.useState<OrgRegion[] | null>(null);
  const [stores, setStores] = React.useState<OrgStore[] | null>(null);
  const [trainers, setTrainers] = React.useState<OrgTrainer[] | null>(null);
  const [managers, setManagers] = React.useState<OrgManager[] | null>(null);

  const refreshAll = React.useCallback(async () => {
    const [r, s, t, m] = await Promise.all([fetchRegions(), fetchStores(), fetchTrainers(), fetchManagers()]);
    setRegions(r);
    setStores(s);
    setTrainers(t);
    setManagers(m);
  }, []);

  React.useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <Tabs defaultValue="stores">
      <TabsList>
        <TabsTrigger value="regions"><Map className="size-3.5" /> Regions</TabsTrigger>
        <TabsTrigger value="stores"><Store className="size-3.5" /> Stores</TabsTrigger>
        <TabsTrigger value="trainers"><Users2 className="size-3.5" /> Trainers</TabsTrigger>
        <TabsTrigger value="managers"><IdCard className="size-3.5" /> Managers</TabsTrigger>
      </TabsList>

      <TabsContent value="regions">
        <RegionsPanel regions={regions} onChanged={() => fetchRegions().then(setRegions)} />
      </TabsContent>
      <TabsContent value="stores">
        <StoresPanel stores={stores} regions={regions ?? []} onChanged={() => fetchStores().then(setStores)} />
      </TabsContent>
      <TabsContent value="trainers">
        <TrainersPanel trainers={trainers} regions={regions ?? []} onChanged={() => fetchTrainers().then(setTrainers)} />
      </TabsContent>
      <TabsContent value="managers">
        <ManagersPanel managers={managers} stores={stores ?? []} onChanged={() => fetchManagers().then(setManagers)} />
      </TabsContent>
    </Tabs>
  );
}

function Loading() {
  return <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading…</div>;
}

function RegionsPanel({ regions, onChanged }: { regions: OrgRegion[] | null; onChanged: () => void }) {
  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function add() {
    if (!code.trim() || !name.trim()) return;
    setSaving(true);
    try {
      await createRegion({ code: code.trim(), name: name.trim() });
      setCode(""); setName("");
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (e.g. reg-east)" className="w-48" />
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Region name (e.g. East)" className="w-56" />
          <Button size="sm" onClick={add} disabled={saving || !code.trim() || !name.trim()}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />} Add Region
          </Button>
        </div>
        {regions === null ? <Loading /> : regions.length === 0 ? (
          <EmptyRow text="No regions yet." />
        ) : (
          <ul className="flex flex-col gap-1.5">
            {regions.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-[10px] bg-surface-muted px-3 py-2 text-sm">
                <div><span className="font-medium">{r.name}</span> <span className="ml-1.5 font-mono text-xs text-muted-foreground">{r.code}</span></div>
                <Button variant="ghost" size="sm" onClick={async () => { await deleteRegion(r.id); onChanged(); }}>
                  <Trash2 className="size-3.5 text-rose" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function StoresPanel({ stores, regions, onChanged }: { stores: OrgStore[] | null; regions: OrgRegion[]; onChanged: () => void }) {
  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [city, setCity] = React.useState("");
  const [regionId, setRegionId] = React.useState<string>("none");
  const [saving, setSaving] = React.useState(false);

  async function add() {
    if (!code.trim() || !name.trim()) return;
    setSaving(true);
    try {
      await createStore({ code: code.trim(), name: name.trim(), city: city.trim() || undefined, regionId: regionId === "none" ? null : regionId });
      setCode(""); setName(""); setCity(""); setRegionId("none");
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Store code" className="w-32" />
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Store name" className="w-48" />
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-36" />
          <Select value={regionId} onValueChange={setRegionId}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Region" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No region</SelectItem>
              {regions.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={add} disabled={saving || !code.trim() || !name.trim()}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />} Add Store
          </Button>
        </div>
        {stores === null ? <Loading /> : stores.length === 0 ? (
          <EmptyRow text="No stores yet — training sign-up needs at least one." />
        ) : (
          <ul className="flex flex-col gap-1.5">
            {stores.map((s) => {
              const region = regions.find((r) => r.id === s.regionId);
              return (
                <li key={s.id} className="flex items-center justify-between rounded-[10px] bg-surface-muted px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{s.code}</span>
                    {s.city && <span className="text-xs text-muted-foreground">· {s.city}</span>}
                    {region && <Badge variant="secondary">{region.name}</Badge>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={async () => { await deleteStore(s.id); onChanged(); }}>
                    <Trash2 className="size-3.5 text-rose" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function TrainersPanel({ trainers, regions, onChanged }: { trainers: OrgTrainer[] | null; regions: OrgRegion[]; onChanged: () => void }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [regionId, setRegionId] = React.useState<string>("none");
  const [saving, setSaving] = React.useState(false);

  async function add() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createTrainer({ name: name.trim(), email: email.trim() || undefined, regionId: regionId === "none" ? null : regionId });
      setName(""); setEmail(""); setRegionId("none");
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Trainer name" className="w-48" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="w-56" />
          <Select value={regionId} onValueChange={setRegionId}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Region" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No region</SelectItem>
              {regions.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={add} disabled={saving || !name.trim()}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />} Add Trainer
          </Button>
        </div>
        {trainers === null ? <Loading /> : trainers.length === 0 ? (
          <EmptyRow text="No trainers yet — training sign-up needs at least one to offer real slots." />
        ) : (
          <ul className="flex flex-col gap-1.5">
            {trainers.map((t) => {
              const region = regions.find((r) => r.id === t.regionId);
              return (
                <li key={t.id} className="flex items-center justify-between rounded-[10px] bg-surface-muted px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t.name}</span>
                    {t.email && <span className="text-xs text-muted-foreground">{t.email}</span>}
                    {region && <Badge variant="secondary">{region.name}</Badge>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={async () => { await deleteTrainer(t.id); onChanged(); }}>
                    <Trash2 className="size-3.5 text-rose" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ManagersPanel({ managers, stores, onChanged }: { managers: OrgManager[] | null; stores: OrgStore[]; onChanged: () => void }) {
  const [name, setName] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [storeId, setStoreId] = React.useState<string>("none");
  const [saving, setSaving] = React.useState(false);

  async function add() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createManager({ name: name.trim(), title: title.trim() || undefined, storeId: storeId === "none" ? null : storeId });
      setName(""); setTitle(""); setStoreId("none");
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Manager name" className="w-48" />
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (e.g. Store Manager)" className="w-56" />
          <Select value={storeId} onValueChange={setStoreId}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Store" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No store</SelectItem>
              {stores.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={add} disabled={saving || !name.trim()}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />} Add Manager
          </Button>
        </div>
        {managers === null ? <Loading /> : managers.length === 0 ? (
          <EmptyRow text="No managers yet." />
        ) : (
          <ul className="flex flex-col gap-1.5">
            {managers.map((m) => {
              const store = stores.find((s) => s.id === m.storeId);
              return (
                <li key={m.id} className="flex items-center justify-between rounded-[10px] bg-surface-muted px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{m.name}</span>
                    {m.title && <span className="text-xs text-muted-foreground">{m.title}</span>}
                    {store && <Badge variant="secondary">{store.name}</Badge>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={async () => { await deleteManager(m.id); onChanged(); }}>
                    <Trash2 className="size-3.5 text-rose" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{text}</p>;
}
