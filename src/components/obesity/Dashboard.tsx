import { useMemo, useState } from "react";
import {
  Activity, Apple, Brain, Dna, Heart, Moon, Scale, Sparkles, Droplet,
  Footprints, Flame, ShieldCheck, AlertTriangle, TrendingDown, ChevronRight,
  MessageSquare,
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import hero from "@/assets/hero-health.jpg";
import { AppGuard } from "./AppGuard";
import { can, useAuth } from "@/lib/auth";
import { REDACT } from "@/lib/privacy";

type Inputs = {
  age: number; bmi: number; sleep: number; activity: number;
  calories: number; sugar: number; genetic: number; pollution: number;
};

const DEFAULT: Inputs = {
  age: 32, bmi: 27.4, sleep: 6.2, activity: 35,
  calories: 2450, sugar: 78, genetic: 62, pollution: 48,
};

function computeRisk(i: Inputs) {
  const bmiR = Math.min(100, Math.max(0, (i.bmi - 18.5) * 7));
  const lifeR = Math.max(0, 100 - i.activity) * 0.6 + Math.max(0, (8 - i.sleep) * 10);
  const dietR = (i.calories - 1800) / 20 + i.sugar * 0.4;
  const envR = i.pollution * 0.5 + i.genetic * 0.5;
  const total = Math.round(Math.min(98, bmiR * 0.3 + lifeR * 0.3 + dietR * 0.2 + envR * 0.2));
  return {
    total,
    metabolic: Math.round(Math.min(99, bmiR * 0.5 + dietR * 0.6)),
    cardio: Math.round(Math.min(99, bmiR * 0.4 + lifeR * 0.5 + i.age * 0.3)),
    neuro: Math.round(Math.min(99, envR * 0.6 + (8 - i.sleep) * 8)),
    hormonal: Math.round(Math.min(99, i.genetic * 0.5 + dietR * 0.3)),
  };
}

const trend = Array.from({ length: 12 }, (_, m) => ({
  m: ["J","F","M","A","M","J","J","A","S","O","N","D"][m],
  risk: 70 - m * 3 + (m % 3) * 4,
  bmi: 28 - m * 0.15,
}));

export function Dashboard() {
  return (
    <AppGuard require="view:dashboard">
      <DashboardBody />
    </AppGuard>
  );
}

function DashboardBody() {
  const { user } = useAuth();
  const role = user?.role ?? null;
  const [i, setI] = useState<Inputs>(DEFAULT);
  const risk = useMemo(() => computeRisk(i), [i]);
  const tier = risk.total > 70 ? "Critical" : risk.total > 45 ? "Elevated" : "Healthy";
  const tierColor = risk.total > 70 ? "text-destructive" : risk.total > 45 ? "text-accent" : "text-primary";

  // Researchers see only aggregates — hide personal risk number.
  const isResearcher = role === "researcher";
  const displayTotal = isResearcher ? REDACT : String(risk.total);
  const displayTier = isResearcher ? "Aggregate view" : tier;

  const radarData = [
    { axis: "Metabolic", v: risk.metabolic },
    { axis: "Cardio", v: risk.cardio },
    { axis: "Neuro", v: risk.neuro },
    { axis: "Hormonal", v: risk.hormonal },
    { axis: "Lifestyle", v: Math.round(100 - i.activity) },
    { axis: "Diet", v: Math.round(i.sugar) },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <header className="relative overflow-hidden border-b border-border">
        <img src={hero} alt="" width={1536} height={1024}
          className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-10 md:py-16">
          <div className="flex items-center gap-2 text-sm tracking-[0.3em] text-primary">
            <Sparkles className="h-4 w-4" /> SATYA · OBESITY INTELLIGENCE
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl md:text-6xl font-bold leading-[1.05]">
            Treat <span className="italic text-primary">before</span> treatment.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground md:text-lg">
            A predictive obesity engine fusing genetic, epigenetic, wearable
            and behavioural signals into one actionable risk score.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {can(role, "write:assessment") && (
              <Button asChild size="lg" className="font-semibold">
                <Link to="/assessment">Run new assessment <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            )}
            {can(role, "view:cohort") && (
              <Button asChild size="lg" variant="outline">
                <Link to="/cohort">View patient cohort</Link>
              </Button>
            )}
            {can(role, "view:chat") && (
              <Button asChild size="lg" variant="secondary">
                <Link to="/chat"><MessageSquare className="mr-2 h-4 w-4" /> Ask Satya AI</Link>
              </Button>
            )}
            {can(role, "view:plan") && (
              <Button asChild size="lg" variant="ghost">
                <Link to="/plan">My prevention plan</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        {/* RISK HEADLINE */}
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 bg-card border-border p-8 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Composite obesity risk</p>
                <div className="mt-2 flex items-end gap-4">
                  <span className="text-7xl md:text-8xl font-bold tabular-nums">{displayTotal}</span>
                  <div className="pb-3">
                    <div className={`text-lg font-semibold ${tierColor}`}>{displayTier}</div>
                    <div className="text-xs text-muted-foreground">/ 100 risk index</div>
                  </div>
                </div>
                <Progress value={isResearcher ? 0 : risk.total} className="mt-5 h-2 w-full max-w-md" />
                {isResearcher && (
                  <p className="mt-3 text-xs text-muted-foreground max-w-md">
                    Individual risk values are redacted for research access. Use the cohort view for de-identified aggregates.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 min-w-[260px]">
                <MiniStat icon={<Heart className="h-4 w-4" />} label="Cardio" val={risk.cardio} />
                <MiniStat icon={<Flame className="h-4 w-4" />} label="Metabolic" val={risk.metabolic} />
                <MiniStat icon={<Brain className="h-4 w-4" />} label="Neuro" val={risk.neuro} />
                <MiniStat icon={<Droplet className="h-4 w-4" />} label="Hormonal" val={risk.hormonal} />
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Risk profile</h3>
              <Badge variant="outline" className="border-primary/40 text-primary">Live</Badge>
            </div>
            <div className="h-56 mt-2">
              <ResponsiveContainer>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="oklch(0.3 0.02 160)" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: "oklch(0.72 0.03 150)", fontSize: 11 }} />
                  <Radar dataKey="v" stroke="oklch(0.82 0.18 145)" fill="oklch(0.82 0.18 145)" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* INPUT PANEL */}
        <section className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3 bg-card border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold">Disease Risk Engine</h2>
                <p className="text-sm text-muted-foreground">Adjust inputs from EHR, wearables and lab reports.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setI(DEFAULT)}>Reset</Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
              <InputRow icon={<Scale className="h-4 w-4" />} label="BMI" value={i.bmi.toFixed(1)}
                slider={<Slider value={[i.bmi]} min={16} max={45} step={0.1}
                  onValueChange={([v]) => setI({ ...i, bmi: v })} />} />
              <InputRow icon={<Footprints className="h-4 w-4" />} label="Activity score" value={`${i.activity}/100`}
                slider={<Slider value={[i.activity]} min={0} max={100}
                  onValueChange={([v]) => setI({ ...i, activity: v })} />} />
              <InputRow icon={<Moon className="h-4 w-4" />} label="Sleep (hrs)" value={i.sleep.toFixed(1)}
                slider={<Slider value={[i.sleep]} min={3} max={10} step={0.1}
                  onValueChange={([v]) => setI({ ...i, sleep: v })} />} />
              <InputRow icon={<Apple className="h-4 w-4" />} label="Daily calories" value={`${i.calories} kcal`}
                slider={<Slider value={[i.calories]} min={1200} max={4500} step={10}
                  onValueChange={([v]) => setI({ ...i, calories: v })} />} />
              <InputRow icon={<Flame className="h-4 w-4" />} label="Sugar intake (g)" value={`${i.sugar}g`}
                slider={<Slider value={[i.sugar]} min={0} max={200}
                  onValueChange={([v]) => setI({ ...i, sugar: v })} />} />
              <InputRow icon={<Dna className="h-4 w-4" />} label="Genetic predisposition" value={`${i.genetic}%`}
                slider={<Slider value={[i.genetic]} min={0} max={100}
                  onValueChange={([v]) => setI({ ...i, genetic: v })} />} />
            </div>
          </Card>

          <Card className="lg:col-span-2 bg-card border-border p-6">
            <h3 className="font-semibold mb-4">12-month risk projection</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={trend} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.82 0.18 145)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.82 0.18 145)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="m" tick={{ fill: "oklch(0.72 0.03 150)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.72 0.03 150)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "oklch(0.21 0.025 160)", border: "1px solid oklch(0.3 0.02 160)", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="risk" stroke="oklch(0.82 0.18 145)" fill="url(#g1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-primary">
              <TrendingDown className="h-4 w-4" /> Projected –28% with current intervention plan
            </div>
          </Card>
        </section>

        {/* DATA SOURCES */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Central data repository</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {[
              { id: "genetic", i: <Dna />, t: "Genetic", s: "DNA + stem cell" },
              { id: "wearables", i: <Activity />, t: "Wearables", s: "HR, steps, SpO₂" },
              { id: "food", i: <Apple />, t: "Food log", s: "Macros & micros" },
              { id: "epigenetic", i: <Brain />, t: "Epigenetic", s: "Methylation" },
              { id: "ehr", i: <ShieldCheck />, t: "EHR", s: "Labs & history" },
            ].map((s) => (
              <Link key={s.id} to="/sources/$id" params={{ id: s.id }} className="block">
                <Card className="bg-card border-border p-4 hover:border-primary/50 transition-colors h-full">
                  <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary grid place-items-center">{s.i}</div>
                  <div className="mt-3 font-semibold">{s.t}</div>
                  <div className="text-xs text-muted-foreground">{s.s}</div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* PREVENTION PLAN */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-accent" />
              <h3 className="font-semibold">Detected early signals</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                "Visceral fat trending +4% over last 90 days",
                "HbA1c marker approaching pre-diabetic threshold",
                "Sleep fragmentation correlates with cortisol spike",
                "FTO gene variant detected — appetite regulation risk",
              ].map((t) => (
                <li key={t} className="flex gap-3 border-l-2 border-accent/60 pl-3">
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Personalised prevention plan</h3>
            </div>
            <ol className="mt-4 space-y-3 text-sm">
              {[
                ["Nutrition", "Shift to 1,950 kcal · 35g sugar cap · Mediterranean macros"],
                ["Movement", "Zone-2 cardio 4×/week + 2 resistance sessions"],
                ["Sleep", "Target 7.5h with circadian wind-down protocol"],
                ["Monitoring", "Weekly CGM + monthly metabolic panel"],
              ].map(([k, v], idx) => (
                <li key={k} className="flex gap-4">
                  <span className="h-6 w-6 shrink-0 rounded-md bg-primary text-primary-foreground text-xs font-bold grid place-items-center">{idx + 1}</span>
                  <div>
                    <div className="font-medium">{k}</div>
                    <div className="text-muted-foreground">{v}</div>
                  </div>
                </li>
              ))}
            </ol>
            <Button asChild className="mt-6 w-full" size="lg">
              <Link to="/plan">Activate plan</Link>
            </Button>
          </Card>
        </section>

        <footer className="pt-8 pb-12 text-center text-xs text-muted-foreground border-t border-border">
          Satya · Good Health & Wellbeing · Prototype
        </footer>
      </main>
    </div>
  );
}

function MiniStat({ icon, label, val }: { icon: React.ReactNode; label: string; val: number }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{val}</div>
    </div>
  );
}

function InputRow({ icon, label, value, slider }: {
  icon: React.ReactNode; label: string; value: string; slider: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</span>
        <span className="text-sm font-semibold tabular-nums">{value}</span>
      </div>
      {slider}
    </div>
  );
}
