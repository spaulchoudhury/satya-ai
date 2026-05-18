import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/assessment")({
  component: AssessmentPage,
  head: () => ({
    meta: [
      { title: "New Assessment — Satya" },
      { name: "description", content: "Run a new personalised obesity risk assessment." },
    ],
  }),
});

const STEPS = ["Identity", "Biometrics", "Lifestyle", "Review"] as const;

function AssessmentPage() {
  const [step, setStep] = useState(0);
  const pct = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mt-6 flex items-center gap-2 text-xs tracking-[0.3em] text-primary">
          <Sparkles className="h-4 w-4" /> ASSESSMENT · STEP {step + 1}/{STEPS.length}
        </div>
        <h1 className="mt-3 text-4xl font-bold">{STEPS[step]}</h1>
        <Progress value={pct} className="mt-4 h-1.5" />

        <Card className="mt-8 bg-card border-border p-8 space-y-5">
          {step === 0 && (
            <>
              <Field label="Full name" placeholder="Patient name" />
              <Field label="Age" placeholder="32" />
              <Field label="Sex assigned at birth" placeholder="Female / Male" />
            </>
          )}
          {step === 1 && (
            <>
              <Field label="Height (cm)" placeholder="172" />
              <Field label="Weight (kg)" placeholder="78" />
              <Field label="Waist (cm)" placeholder="86" />
              <Field label="Resting heart rate" placeholder="68" />
            </>
          )}
          {step === 2 && (
            <>
              <Field label="Average sleep (hrs)" placeholder="6.5" />
              <Field label="Weekly activity (min)" placeholder="180" />
              <Field label="Daily added sugar (g)" placeholder="60" />
            </>
          )}
          {step === 3 && (
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Your inputs will be fused with genetic, epigenetic and wearable signals.</p>
              <p>Expected processing time: ~30 seconds.</p>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
            ) : (
              <Button asChild><Link to="/">Submit & view results</Link></Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input placeholder={placeholder} />
    </div>
  );
}