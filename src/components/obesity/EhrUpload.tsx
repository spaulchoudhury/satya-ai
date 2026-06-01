import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FileUp, Loader2, ShieldCheck, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { parseEhrPdf, type ExtractedVitals } from "@/lib/ehr-parse";
import { PATIENTS_KEY, useStored, type StoredPatient } from "@/lib/store";

export function EhrUpload() {
  const [, setPatients] = useStored<StoredPatient[]>(PATIENTS_KEY, []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ vitals: ExtractedVitals; patientId: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  async function onFile(file: File) {
    setError(null);
    setPreview(null);
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit.");
      return;
    }
    setBusy(true);
    try {
      const { vitals, patient } = await parseEhrPdf(file);
      setPatients((prev) => [patient, ...prev]);
      setPreview({ vitals, patientId: patient.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Import patient from EHR (PDF)</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Drop a discharge summary or vitals report. Satya extracts BMI, vitals
            and lifestyle markers and adds the patient to the live cohort with
            your current access controls.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 text-primary" /> Parsed in-browser · PHI never leaves device
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="ehr-pdf"
          className="flex flex-col items-center justify-center gap-2 border border-dashed border-border rounded-lg py-8 px-4 cursor-pointer hover:border-primary/60 transition-colors bg-background/30"
        >
          {busy ? (
            <>
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <div className="text-sm text-muted-foreground">Extracting vitals…</div>
            </>
          ) : (
            <>
              <FileUp className="h-6 w-6 text-primary" />
              <div className="text-sm font-medium">Click to upload an EHR PDF</div>
              <div className="text-xs text-muted-foreground">Max 10MB · BMI, weight, BP, HR, lifestyle</div>
            </>
          )}
          <input
            ref={inputRef}
            id="ehr-pdf"
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
              if (inputRef.current) inputRef.current.value = "";
            }}
          />
        </label>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-sm px-3 py-2">
          <AlertTriangle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {preview && (
        <div className="mt-5 rounded-md border border-primary/30 bg-primary/5 p-4">
          <div className="text-xs uppercase tracking-widest text-primary">Extracted</div>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <Field k="Name" v={preview.vitals.name} />
            <Field k="Age" v={preview.vitals.age} />
            <Field k="Sex" v={preview.vitals.sex} />
            <Field k="BMI" v={preview.vitals.bmi} />
            <Field k="Height" v={preview.vitals.height ? `${preview.vitals.height} cm` : undefined} />
            <Field k="Weight" v={preview.vitals.weight ? `${preview.vitals.weight} kg` : undefined} />
            <Field k="Waist" v={preview.vitals.waist ? `${preview.vitals.waist} cm` : undefined} />
            <Field k="HR" v={preview.vitals.hr} />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-muted-foreground">
              Added as <span className="font-mono text-foreground">{preview.patientId}</span>.
              Visibility follows your role-based access rules.
            </div>
            <Button size="sm" onClick={() => navigate({ to: "/cohort" })}>
              Open cohort
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Field({ k, v }: { k: string; v: string | number | undefined }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="font-medium">{v ?? "—"}</div>
    </div>
  );
}