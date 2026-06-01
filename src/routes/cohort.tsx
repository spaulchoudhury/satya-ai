import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Search, Sparkles, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PATIENTS_KEY, useStored, type StoredPatient } from "@/lib/store";
import { AppGuard } from "@/components/obesity/AppGuard";
import { useAuth, ROLE_LABEL } from "@/lib/auth";
import { viewPatient } from "@/lib/privacy";

export const Route = createFileRoute("/cohort")({
  component: CohortRoute,
  head: () => ({
    meta: [
      { title: "Patient Cohort — Satya" },
      { name: "description", content: "Browse the obesity risk cohort with live composite scores." },
    ],
  }),
});

const SEED: Array<Omit<StoredPatient, "createdAt">> = [
  { id: "P-1042", name: "Aisha Khan", age: 41, bmi: 31.2, risk: 82, tier: "Critical" },
  { id: "P-1043", name: "Marco Rivera", age: 36, bmi: 27.8, risk: 64, tier: "Elevated" },
  { id: "P-1044", name: "Yuki Tanaka", age: 29, bmi: 23.1, risk: 28, tier: "Healthy" },
  { id: "P-1045", name: "Liam O'Connor", age: 52, bmi: 33.9, risk: 88, tier: "Critical" },
  { id: "P-1046", name: "Sara Lindqvist", age: 34, bmi: 25.4, risk: 41, tier: "Elevated" },
  { id: "P-1047", name: "Dev Patel", age: 47, bmi: 29.6, risk: 71, tier: "Critical" },
  { id: "P-1048", name: "Noor Al-Fahad", age: 25, bmi: 21.8, risk: 19, tier: "Healthy" },
];

function CohortRoute() {
  return (
    <AppGuard require="view:cohort">
      <CohortPage />
    </AppGuard>
  );
}

function CohortPage() {
  const { user } = useAuth();
  const role = user?.role ?? null;
  const [stored] = useStored<StoredPatient[]>(PATIENTS_KEY, []);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const all = [...stored, ...SEED.map((s) => ({ ...s, createdAt: 0 }))];
    // Newly added patients (createdAt > 0) float to the top, sorted by
    // most-recent first. Seeded cohort below, sorted by composite risk.
    const sorted = all.sort((a, b) => {
      if (a.createdAt > 0 && b.createdAt === 0) return -1;
      if (b.createdAt > 0 && a.createdAt === 0) return 1;
      if (a.createdAt > 0 && b.createdAt > 0) return b.createdAt - a.createdAt;
      return b.risk - a.risk;
    });
    const views = sorted.map((p) => ({ raw: p, view: viewPatient(p, role) }));
    const q = query.trim().toLowerCase();
    if (!q) return views;
    // Researchers can only search by anonymised pseudo-ID
    if (role === "researcher") {
      return views.filter(({ view }) => view.id.toLowerCase().includes(q));
    }
    return views.filter(({ raw, view }) =>
      raw.name.toLowerCase().includes(q) ||
      raw.id.toLowerCase().includes(q) ||
      view.id.toLowerCase().includes(q),
    );
  }, [stored, query, role]);

  const isResearcher = role === "researcher";
  const tierCounts = rows.reduce<Record<string, number>>((m, r) => {
    m[r.view.tier] = (m[r.view.tier] ?? 0) + 1;
    return m;
  }, {});

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <h1 className="mt-6 text-4xl font-bold">Patient cohort</h1>
        <p className="mt-2 text-muted-foreground">
          {rows.length} patients · sorted by composite risk
          {stored.length > 0 && <span className="ml-2 text-primary">· {stored.length} newly assessed</span>}
        </p>

        <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-md px-3 py-1.5">
          <ShieldCheck className="h-3 w-3 text-primary" />
          Viewing as <span className="text-foreground font-medium">{user ? ROLE_LABEL[user.role] : "—"}</span>
          {role === "nurse" && <span>· names → initials, ages → bands</span>}
          {role === "researcher" && <span>· de-identified · pseudo-IDs only</span>}
          {role === "clinician" && <span>· full PHI · audit-logged</span>}
        </div>

        {isResearcher && (
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-xl">
            {(["Critical","Elevated","Healthy"] as const).map((t) => (
              <Card key={t} className="bg-card border-border p-4">
                <div className="text-xs text-muted-foreground">{t}</div>
                <div className="mt-1 text-2xl font-bold tabular-nums">{tierCounts[t] ?? 0}</div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isResearcher ? "Search by pseudo-ID (e.g. ANON-…)" : "Search patient or ID"}
            className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Card className="mt-6 bg-card border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background/40 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">ID</th>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Age</th>
                <th className="text-left px-5 py-3">BMI</th>
                <th className="text-left px-5 py-3">Risk</th>
                <th className="text-left px-5 py-3">Tier</th>
                <th className="text-left px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ raw, view: p }) => (
                <tr key={raw.id} className={`border-t border-border hover:bg-background/30 transition-colors ${p.createdAt > 0 ? "bg-primary/5" : ""}`}>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{p.id}</td>
                  <td className="px-5 py-4 font-medium">{p.name}</td>
                  <td className="px-5 py-4">{p.ageDisplay}</td>
                  <td className="px-5 py-4 tabular-nums">{p.bmiDisplay}</td>
                  <td className="px-5 py-4 font-bold tabular-nums">{p.riskDisplay}</td>
                  <td className="px-5 py-4">
                    <Badge variant="outline" className={
                      p.tier === "Critical" ? "border-destructive/50 text-destructive" :
                      p.tier === "Elevated" ? "border-accent/50 text-accent" :
                      "border-primary/50 text-primary"
                    }>{p.tier}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    {p.createdAt > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-primary">
                        <Sparkles className="h-3 w-3" /> new
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Access to identifiable health information is governed by role-based access control.
          All views are audit-logged for HIPAA / GDPR compliance.
        </p>
      </div>
    </div>
  );
}