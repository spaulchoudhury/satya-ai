import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Apple, Footprints, Moon, Activity, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/plan")({
  component: PlanPage,
  head: () => ({
    meta: [
      { title: "Prevention Plan — Satya" },
      { name: "description", content: "Your activated 12-week personalised obesity prevention plan." },
    ],
  }),
});

const PILLARS = [
  { i: <Apple className="h-5 w-5" />, t: "Nutrition", d: "1,950 kcal · 35g sugar cap · Mediterranean macros · 3 meals + 1 snack" },
  { i: <Footprints className="h-5 w-5" />, t: "Movement", d: "Zone-2 cardio 4×/week · 2 resistance sessions · 8,500 daily steps" },
  { i: <Moon className="h-5 w-5" />, t: "Sleep", d: "7.5h target · circadian wind-down 22:30 · no screens after 22:00" },
  { i: <Activity className="h-5 w-5" />, t: "Monitoring", d: "Continuous glucose monitor · monthly metabolic panel · weekly weigh-in" },
];

const WEEKS = Array.from({ length: 12 }, (_, w) => ({
  w: w + 1,
  focus: ["Baseline labs", "Macro reset", "Cardio ramp", "Strength block", "CGM review", "Sleep protocol",
    "Stress audit", "Mid-point panel", "Intensity push", "Habit lock-in", "Maintenance prep", "Re-assessment"][w],
}));

function PlanPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mt-6 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-primary font-semibold">Plan activated</span>
        </div>
        <h1 className="mt-2 text-4xl font-bold">Your 12-week prevention program</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Projected risk reduction: <span className="text-primary font-semibold">–28%</span> by week 12.
          Adjustments are auto-tuned from wearable and CGM data each Sunday.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {PILLARS.map((p) => (
            <Card key={p.t} className="bg-card border-border p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary grid place-items-center">{p.i}</div>
                <h3 className="font-semibold text-lg">{p.t}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{p.d}</p>
            </Card>
          ))}
        </div>

        <h2 className="mt-10 text-xl font-semibold">12-week schedule</h2>
        <Card className="mt-4 bg-card border-border p-2">
          <ol className="divide-y divide-border">
            {WEEKS.map((w) => (
              <li key={w.w} className="flex items-center gap-4 px-4 py-3">
                <span className="h-8 w-8 grid place-items-center rounded-md bg-primary/15 text-primary text-xs font-bold">W{w.w}</span>
                <span className="text-sm">{w.focus}</span>
              </li>
            ))}
          </ol>
        </Card>

        <div className="mt-8 flex gap-3">
          <Button asChild size="lg"><Link to="/">Return to dashboard</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/cohort">View cohort</Link></Button>
        </div>
      </div>
    </div>
  );
}