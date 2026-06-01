import {
  computePatientRisk,
  tierFromRisk,
  type StoredPatient,
} from "./store";

// Lazy-load pdfjs so the heavy worker isn't pulled into SSR or the initial bundle.
async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  // Vite-bundled worker URL
  const workerSrc = (
    await import("pdfjs-dist/build/pdf.worker.min.mjs?url")
  ).default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfjs as any).GlobalWorkerOptions.workerSrc = workerSrc;

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  let text = "";
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    text +=
      content.items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((it: any) => ("str" in it ? it.str : ""))
        .join(" ") + "\n";
  }
  return text;
}

function num(re: RegExp, text: string): number | undefined {
  const m = text.match(re);
  if (!m) return undefined;
  const v = parseFloat(m[1]);
  return Number.isFinite(v) ? v : undefined;
}

export type ExtractedVitals = {
  name?: string;
  age?: number;
  sex?: string;
  height?: number; // cm
  weight?: number; // kg
  waist?: number; // cm
  hr?: number;
  bmi?: number;
  sleep?: number;
  activityMin?: number;
  sugar?: number;
};

export function parseVitalsFromText(raw: string): ExtractedVitals {
  // Normalise whitespace for easier regex matching.
  const text = raw.replace(/\s+/g, " ");

  const nameMatch =
    text.match(/Patient(?:\s*Name)?\s*[:\-]\s*([A-Z][A-Za-z'\-]+(?:\s+[A-Z][A-Za-z'\-]+){0,3})/) ||
    text.match(/Name\s*[:\-]\s*([A-Z][A-Za-z'\-]+(?:\s+[A-Z][A-Za-z'\-]+){0,3})/);

  const sexMatch = text.match(/\bSex\s*[:\-]\s*(Male|Female|M|F)\b/i);

  const height = num(/Height\s*[:\-]?\s*(\d{2,3}(?:\.\d+)?)\s*cm/i, text);
  const weight = num(/Weight\s*[:\-]?\s*(\d{2,3}(?:\.\d+)?)\s*kg/i, text);
  const waist = num(/Waist\s*[:\-]?\s*(\d{2,3}(?:\.\d+)?)\s*cm/i, text);
  const hr =
    num(/(?:Resting\s+)?Heart\s*Rate\s*[:\-]?\s*(\d{2,3})/i, text) ??
    num(/\bHR\s*[:\-]?\s*(\d{2,3})\b/i, text);
  const bmiParsed = num(/\bBMI\s*[:\-]?\s*(\d{2}(?:\.\d+)?)/i, text);
  const age = num(/\bAge\s*[:\-]?\s*(\d{1,3})\b/i, text);
  const sleep = num(/Sleep\s*[:\-]?\s*(\d(?:\.\d+)?)\s*(?:h|hr|hrs|hours)/i, text);
  const activityMin =
    num(/Activity\s*[:\-]?\s*(\d{2,4})\s*(?:min|minutes)/i, text) ??
    num(/Exercise\s*[:\-]?\s*(\d{2,4})\s*(?:min|minutes)/i, text);
  const sugar = num(/Sugar\s*[:\-]?\s*(\d{1,3})\s*g/i, text);

  let bmi = bmiParsed;
  if (!bmi && height && weight && height > 0) {
    bmi = +(weight / Math.pow(height / 100, 2)).toFixed(1);
  }

  return {
    name: nameMatch?.[1]?.trim(),
    age,
    sex: sexMatch ? (sexMatch[1].toUpperCase().startsWith("M") ? "Male" : "Female") : undefined,
    height,
    weight,
    waist,
    hr,
    bmi,
    sleep,
    activityMin,
    sugar,
  };
}

export function vitalsToPatient(v: ExtractedVitals): StoredPatient {
  const age = v.age ?? 35;
  const bmi = v.bmi ?? 25;
  const risk = computePatientRisk({
    bmi,
    sleep: v.sleep,
    activityMin: v.activityMin,
    sugar: v.sugar,
    age,
  });
  return {
    id: `P-${Math.floor(1000 + Math.random() * 9000)}`,
    name: v.name?.trim() || "EHR Import",
    age,
    sex: v.sex,
    height: v.height,
    weight: v.weight,
    waist: v.waist,
    hr: v.hr,
    sleep: v.sleep,
    activityMin: v.activityMin,
    sugar: v.sugar,
    bmi: +bmi.toFixed(1),
    risk,
    tier: tierFromRisk(risk),
    createdAt: Date.now(),
  };
}

export async function parseEhrPdf(file: File): Promise<{
  vitals: ExtractedVitals;
  patient: StoredPatient;
  rawText: string;
}> {
  const rawText = await extractPdfText(file);
  const vitals = parseVitalsFromText(rawText);
  const patient = vitalsToPatient(vitals);
  return { vitals, patient, rawText };
}