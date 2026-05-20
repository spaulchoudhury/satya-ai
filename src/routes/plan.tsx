import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Apple, Footprints, Moon, Activity, CheckCircle2, Sparkles, Brain, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLAN_KEY, useStored, type PlanSuggestion } from "@/lib/store";
import { useMemo } from "react";

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
  { key: "Nutrition", i: <Apple className="h-5 w-5" />, d: "1,950 kcal · 35g sugar cap · Mediterranean macros · 3 meals + 1 snack" },
  { key: "Movement", i: <Footprints className="h-5 w-5" />, d: "Zone-2 cardio 4×/week · 2 resistance sessions · 8,500 daily steps" },
  { key: "Sleep", i: <Moon className="h-5 w-5" />, d: "7.5h target · circadian wind-down 22:30 · no screens after 22:00" },
  { key: "Monitoring", i: <Activity className="h-5 w-5" />, d: "Continuous glucose monitor · monthly metabolic panel · weekly weigh-in" },
  { key: "Mindset", i: <Brain className="h-5 w-5" />, d: "Daily 10-min mindfulness · stress journaling · cortisol-aware schedule" },
] as const;

const WEEKS = Array.from({ length: 12 }, (_, w) => ({
  w: w + 1,
  focus: ["Baseline labs", "Macro reset", "Cardio ramp", "Strength block", "CGM review", "Sleep protocol",
    "Stress audit", "Mid-point panel", "Intensity push", "Habit lock-in", "Maintenance prep", "Re-assessment"][w],
}));

function PlanPage() {
  const [suggestions, setSuggestions] = useStored<PlanSuggestion[]>(PLAN_KEY, []);

  const grouped = useMemo(() => {
    const map: Record<string, PlanSuggestion[]> = {};
    for (const s of suggestions) (map[s.pillar] ||= []).push(s);
    return map;
  }, [suggestions]);

  const dismiss = (id: string) =>
    setSuggestions((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mt-6 flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-primary font-semibold">Plan activated</span>
          {suggestions.length > 0 && (
            <Badge variant="outline" className="border-primary/40 text-primary ml-2">
              <Sparkles className="h-3 w-3 mr-1" /> {suggestions.length} Satya suggestions
            </Badge>
          )}
        </div>
        <h1 className="mt-2 text-4xl font-bold">Your 12-week prevention program</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Projected risk reduction: <span className="text-primary font-semibold">–28%</span> by week 12.
          Adjustments are auto-tuned from wearable and CGM data each Sunday.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {PILLARS.map((p) => {
            const extras = grouped[p.key] ?? [];
            return (
              <Card key={p.key} className="bg-card border-border p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary grid place-items-center">{p.i}</div>
                  <h3 className="font-semibold text-lg">{p.key}</h3>
                  {extras.length > 0 && (
                    <Badge variant="outline" className="ml-auto border-accent/50 text-accent text-[10px]">
                      +{extras.length} from Satya
                    </Badge>
                  )}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{p.d}</p>
                {extras.length > 0 && (
                  <ul className="mt-4 space-y-2 border-t border-border pt-3">
                    {extras.map((s) => (
                      <li key={s.id} className="group flex items-start gap-2 text-xs">
                        <Sparkles className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                        <span className="flex-1 text-muted-foreground leading-relaxed">{s.text}</span>
                        <button
                          onClick={() => dismiss(s.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                          aria-label="Dismiss suggestion"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>

        {suggestions.length === 0 && (
          <Card className="mt-6 bg-card border-dashed border-border p-5 text-sm text-muted-foreground flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-primary" />
            Chat with <Link to="/chat" className="text-primary underline">Satya AI</Link> — relevant guidance will automatically extend the pillars above.
          </Card>
        )}

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
          <Button asChild size="lg" variant="secondary"><Link to="/chat">Ask Satya AI</Link></Button>
        </div>
      </div>
    </div>
  );
}