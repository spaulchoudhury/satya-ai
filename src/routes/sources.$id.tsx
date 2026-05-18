import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Dna, Activity, Apple, Brain, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/sources/$id")({
  component: SourcePage,
  head: ({ params }) => ({
    meta: [
      { title: `${(SOURCES[params.id]?.title) ?? "Data source"} — Satya` },
      { name: "description", content: SOURCES[params.id]?.summary ?? "Data source detail." },
    ],
  }),
});

type Source = {
  title: string;
  icon: ReactNode;
  summary: string;
  signals: { k: string; v: string }[];
  status: string;
};

const SOURCES: Record<string, Source> = {
  genetic: {
    title: "Genetic & stem-cell panel",
    icon: <Dna className="h-6 w-6" />,
    summary: "Whole-genome SNP screen for obesity-linked variants and stem-cell adipogenesis markers.",
    signals: [
      { k: "FTO variant", v: "Risk allele detected" },
      { k: "MC4R", v: "Wild-type" },
      { k: "LEPR sensitivity", v: "Reduced (-18%)" },
      { k: "Adipogenic potential", v: "Elevated" },
    ],
    status: "Synced 2 days ago",
  },
  wearables: {
    title: "Wearable telemetry",
    icon: <Activity className="h-6 w-6" />,
    summary: "Continuous heart rate, steps, SpO₂ and HRV from connected wearables.",
    signals: [
      { k: "Resting HR (7d avg)", v: "68 bpm" },
      { k: "Steps (7d avg)", v: "6,420 / day" },
      { k: "SpO₂", v: "97%" },
      { k: "HRV", v: "42 ms" },
    ],
    status: "Live stream · Apple Watch",
  },
  food: {
    title: "Food & nutrition log",
    icon: <Apple className="h-6 w-6" />,
    summary: "Logged meals and CGM-derived glycemic response across macros and micronutrients.",
    signals: [
      { k: "Avg daily calories", v: "2,450 kcal" },
      { k: "Added sugar", v: "78 g" },
      { k: "Fiber", v: "18 g (low)" },
      { k: "Glucose AUC", v: "Elevated post-dinner" },
    ],
    status: "Last entry 3h ago",
  },
  epigenetic: {
    title: "Epigenetic methylation",
    icon: <Brain className="h-6 w-6" />,
    summary: "DNA methylation patterns reflecting environmental and lifestyle impact on gene expression.",
    signals: [
      { k: "Biological age", v: "+3.2 yrs vs chronological" },
      { k: "Inflammation score", v: "Moderate" },
      { k: "Cortisol methylation", v: "Hyper-methylated" },
      { k: "Diet response markers", v: "Sensitive" },
    ],
    status: "Updated quarterly",
  },
  ehr: {
    title: "Electronic health record",
    icon: <ShieldCheck className="h-6 w-6" />,
    summary: "Clinical labs, history, prescriptions and prior assessments from provider EHR.",
    signals: [
      { k: "HbA1c", v: "5.8% (pre-diabetic)" },
      { k: "LDL", v: "138 mg/dL" },
      { k: "Triglycerides", v: "175 mg/dL" },
      { k: "Blood pressure", v: "128/84" },
    ],
    status: "FHIR sync · Epic",
  },
};

function SourcePage() {
  const { id } = Route.useParams();
  const src = SOURCES[id];
  if (!src) throw notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-primary/15 text-primary grid place-items-center">{src.icon}</div>
          <div>
            <h1 className="text-3xl font-bold">{src.title}</h1>
            <Badge variant="outline" className="mt-2 border-primary/40 text-primary">{src.status}</Badge>
          </div>
        </div>

        <p className="mt-6 text-muted-foreground max-w-2xl">{src.summary}</p>

        <h2 className="mt-10 text-xl font-semibold">Latest signals</h2>
        <Card className="mt-4 bg-card border-border divide-y divide-border">
          {src.signals.map((s) => (
            <div key={s.k} className="flex items-center justify-between px-5 py-4">
              <span className="text-sm text-muted-foreground">{s.k}</span>
              <span className="font-semibold tabular-nums">{s.v}</span>
            </div>
          ))}
        </Card>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {Object.entries(SOURCES).filter(([k]) => k !== id).slice(0, 3).map(([k, v]) => (
            <Link key={k} to="/sources/$id" params={{ id: k }} className="block">
              <Card className="bg-card border-border p-4 hover:border-primary/50 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary grid place-items-center">{v.icon}</div>
                <div className="mt-3 font-semibold text-sm">{v.title}</div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}