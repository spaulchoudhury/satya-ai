import type { StoredPatient } from "./store";
import type { Role } from "./auth";

export const REDACT = "•••";

export function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return (
    parts
      .map((s) => s[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("") || "—"
  );
}

export function ageBand(age: number) {
  const lo = Math.max(0, Math.floor(age / 10) * 10);
  return `${lo}–${lo + 9}`;
}

export function pseudoId(id: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return "ANON-" + h.toString(16).toUpperCase().slice(0, 6).padStart(6, "0");
}

export type PrivacyView = {
  id: string;
  name: string;
  ageDisplay: string;
  bmiDisplay: string;
  riskDisplay: string;
  tier: StoredPatient["tier"];
  createdAt: number;
  canOpenRecord: boolean;
};

export function viewPatient(p: StoredPatient, role: Role | null): PrivacyView {
  switch (role) {
    case "clinician":
      return {
        id: p.id, name: p.name,
        ageDisplay: String(p.age),
        bmiDisplay: p.bmi.toFixed(1),
        riskDisplay: String(p.risk),
        tier: p.tier, createdAt: p.createdAt, canOpenRecord: true,
      };
    case "nurse":
      return {
        id: p.id, name: initials(p.name),
        ageDisplay: ageBand(p.age),
        bmiDisplay: p.bmi.toFixed(1),
        riskDisplay: String(p.risk),
        tier: p.tier, createdAt: p.createdAt, canOpenRecord: true,
      };
    case "researcher":
      return {
        id: pseudoId(p.id), name: REDACT,
        ageDisplay: ageBand(p.age),
        bmiDisplay: Math.round(p.bmi).toString(),
        riskDisplay: String(Math.round(p.risk / 5) * 5),
        tier: p.tier, createdAt: p.createdAt, canOpenRecord: false,
      };
    case "patient":
    default:
      return {
        id: pseudoId(p.id), name: REDACT,
        ageDisplay: REDACT, bmiDisplay: REDACT, riskDisplay: REDACT,
        tier: p.tier, createdAt: p.createdAt, canOpenRecord: false,
      };
  }
}

// For source signal values: redact for non-full-source viewers.
export function maskSignal(value: string, role: Role | null): string {
  if (role === "clinician") return value;
  if (role === "nurse") return value; // care coordinator sees clinical signals
  return REDACT;
}