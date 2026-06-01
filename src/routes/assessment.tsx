import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PATIENTS_KEY,
  computePatientRisk,
  tierFromRisk,
  useStored,
  type StoredPatient,
} from "@/lib/store";
import { AppGuard } from "@/components/obesity/AppGuard";
import { toast } from "sonner";

export const Route = createFileRoute("/assessment")({
  component: AssessmentRoute,
  head: () => ({
    meta: [
      { title: "New Assessment — Satya" },
      { name: "description", content: "Run a new personalised obesity risk assessment." },
    ],
  }),
});

function AssessmentRoute() {
  return (
    <AppGuard require="write:assessment">
      <AssessmentPage />
    </AppGuard>
  );
}

const STEPS = ["Identity", "Biometrics", "Lifestyle", "Review"] as const;

type Form = {
  name: string; age: string; sex: string;
  height: string; weight: string; waist: string; hr: string;
  sleep: string; activityMin: string; sugar: string;
};

const EMPTY: Form = {
  name: "", age: "", sex: "",
  height: "", weight: "", waist: "", hr: "",
  sleep: "", activityMin: "", sugar: "",
};

function AssessmentPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [, setPatients] = useStored<StoredPatient[]>(PATIENTS_KEY, []);
  const navigate = useNavigate();
  const pct = ((step + 1) / STEPS.length) * 100;

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    const height = parseFloat(form.height) || 0;
    const weight = parseFloat(form.weight) || 0;
    const age = parseInt(form.age) || 30;
    const bmi =
      height > 0 && weight > 0
        ? +(weight / Math.pow(height / 100, 2)).toFixed(1)
        : 25;
    const sleep = parseFloat(form.sleep) || undefined;
    const activityMin = parseFloat(form.activityMin) || undefined;
    const sugar = parseFloat(form.sugar) || undefined;
    const risk = computePatientRisk({ bmi, sleep, activityMin, sugar, age });
    const patient: StoredPatient = {
      id: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      name: form.name.trim() || "Unnamed patient",
      age,
      sex: form.sex || undefined,
      height: height || undefined,
      weight: weight || undefined,
      waist: parseFloat(form.waist) || undefined,
      hr: parseFloat(form.hr) || undefined,
      sleep, activityMin, sugar,
      bmi, risk, tier: tierFromRisk(risk),
      createdAt: Date.now(),
    };
    setPatients((prev) => [patient, ...prev]);
    toast.success(`${patient.name} added to cohort`, {
      description: `${patient.id} · BMI ${patient.bmi} · Risk ${patient.risk} (${patient.tier})`,
    });
    navigate({ to: "/cohort" });
  };

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
              <Field label="Full name" placeholder="Patient name" value={form.name} onChange={set("name")} />
              <Field label="Age" placeholder="32" value={form.age} onChange={set("age")} />
              <Field label="Sex assigned at birth" placeholder="Female / Male" value={form.sex} onChange={set("sex")} />
            </>
          )}
          {step === 1 && (
            <>
              <Field label="Height (cm)" placeholder="172" value={form.height} onChange={set("height")} />
              <Field label="Weight (kg)" placeholder="78" value={form.weight} onChange={set("weight")} />
              <Field label="Waist (cm)" placeholder="86" value={form.waist} onChange={set("waist")} />
              <Field label="Resting heart rate" placeholder="68" value={form.hr} onChange={set("hr")} />
            </>
          )}
          {step === 2 && (
            <>
              <Field label="Average sleep (hrs)" placeholder="6.5" value={form.sleep} onChange={set("sleep")} />
              <Field label="Weekly activity (min)" placeholder="180" value={form.activityMin} onChange={set("activityMin")} />
              <Field label="Daily added sugar (g)" placeholder="60" value={form.sugar} onChange={set("sugar")} />
            </>
          )}
          {step === 3 && (
            <div className="text-sm space-y-3">
              <p className="text-muted-foreground">Review captured biometrics before adding {form.name || "patient"} to the cohort.</p>
              <div className="grid grid-cols-2 gap-3 rounded-md border border-border bg-background/40 p-4 text-sm">
                <Row k="Name" v={form.name || "—"} />
                <Row k="Age" v={form.age || "—"} />
                <Row k="Sex" v={form.sex || "—"} />
                <Row k="Height" v={form.height ? `${form.height} cm` : "—"} />
                <Row k="Weight" v={form.weight ? `${form.weight} kg` : "—"} />
                <Row k="Sleep" v={form.sleep ? `${form.sleep} h` : "—"} />
                <Row k="Activity" v={form.activityMin ? `${form.activityMin} min/wk` : "—"} />
                <Row k="Sugar" v={form.sugar ? `${form.sugar} g/d` : "—"} />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
            ) : (
              <Button onClick={submit}>Submit & add to cohort</Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label, placeholder, value, onChange,
}: {
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}