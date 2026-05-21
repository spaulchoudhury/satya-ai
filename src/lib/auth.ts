import { useEffect, useState } from "react";

export type Role = "patient" | "clinician" | "nurse" | "researcher";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  patientId?: string;
};

const KEY = "satya.auth.user.v1";
const listeners = new Set<() => void>();

export const DEMO_ACCOUNTS: AuthUser[] = [
  { id: "u-pat", name: "Aisha Khan",        email: "aisha@patient.demo",  role: "patient",    patientId: "P-1042" },
  { id: "u-doc", name: "Dr. Elena Vasquez", email: "elena@clinic.demo",   role: "clinician" },
  { id: "u-nur", name: "Jordan Mehta, RN",  email: "jordan@clinic.demo",  role: "nurse" },
  { id: "u-res", name: "Dr. Priya Rao",     email: "priya@research.demo", role: "researcher" },
];

export const ROLE_LABEL: Record<Role, string> = {
  patient: "Patient",
  clinician: "Clinician",
  nurse: "Care Coordinator",
  researcher: "Researcher / Admin",
};

export const ROLE_BLURB: Record<Role, string> = {
  patient: "See only your own risk, plan and AI chat. No cohort access.",
  clinician: "Full PHI access for assigned patients, assessments, plan & chat.",
  nurse: "Cohort with masked identifiers (initials + age band). Can run assessments.",
  researcher: "De-identified cohort aggregates only. No names, no transcripts.",
};

function read(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function loginAs(user: AuthUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(user));
  listeners.forEach((l) => l());
}

export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}

export function useAuth() {
  // ready=false until client mount to avoid SSR redirect flashes
  const [state, setState] = useState<{ ready: boolean; user: AuthUser | null }>({
    ready: false,
    user: null,
  });
  useEffect(() => {
    const refresh = () => setState({ ready: true, user: read() });
    refresh();
    listeners.add(refresh);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return state;
}

export type Capability =
  | "view:dashboard"
  | "view:cohort"
  | "view:cohort.full"
  | "view:assessment"
  | "write:assessment"
  | "view:plan"
  | "view:chat"
  | "view:sources"
  | "view:sources.full"
  | "view:admin";

const CAPS: Record<Role, Capability[]> = {
  patient: ["view:dashboard", "view:plan", "view:chat"],
  nurse: [
    "view:dashboard", "view:cohort",
    "view:assessment", "write:assessment",
    "view:plan", "view:sources", "view:chat",
  ],
  clinician: [
    "view:dashboard", "view:cohort", "view:cohort.full",
    "view:assessment", "write:assessment",
    "view:plan", "view:sources", "view:sources.full", "view:chat",
  ],
  researcher: ["view:dashboard", "view:cohort", "view:admin"],
};

export function can(role: Role | null | undefined, cap: Capability): boolean {
  if (!role) return false;
  return CAPS[role].includes(cap);
}