import { useEffect, useState, useCallback } from "react";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function emit(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  emit(key);
}

export function useStored<T>(key: string, fallback: T) {
  // Always start with fallback to keep SSR and first client render identical.
  // Hydrate from localStorage in an effect to avoid hydration mismatches.
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    setValue(read(key, fallback));
    const l = () => setValue(read(key, fallback));
    let set = listeners.get(key);
    if (!set) {
      set = new Set();
      listeners.set(key, set);
    }
    set.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) l();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      set!.delete(l);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read<T>(key, fallback);
      const computed =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      write(key, computed);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, update] as const;
}

// ---- Domain types ----

export type StoredPatient = {
  id: string;
  name: string;
  age: number;
  sex?: string;
  height?: number;
  weight?: number;
  waist?: number;
  hr?: number;
  sleep?: number;
  activityMin?: number;
  sugar?: number;
  bmi: number;
  risk: number;
  tier: "Critical" | "Elevated" | "Healthy";
  createdAt: number;
};

export const PATIENTS_KEY = "satya.patients.v1";

export function tierFromRisk(risk: number): StoredPatient["tier"] {
  return risk > 70 ? "Critical" : risk > 45 ? "Elevated" : "Healthy";
}

export function computePatientRisk(p: {
  bmi: number;
  sleep?: number;
  activityMin?: number;
  sugar?: number;
  age: number;
}) {
  const bmiR = Math.min(100, Math.max(0, (p.bmi - 18.5) * 7));
  const lifeR =
    Math.max(0, 100 - ((p.activityMin ?? 150) / 3)) * 0.5 +
    Math.max(0, (8 - (p.sleep ?? 7)) * 10);
  const dietR = (p.sugar ?? 40) * 0.5;
  const ageR = Math.max(0, (p.age - 25) * 0.4);
  return Math.round(
    Math.min(98, bmiR * 0.45 + lifeR * 0.25 + dietR * 0.15 + ageR * 0.15),
  );
}

// ---- Chat sessions ----

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
};

export const CHAT_KEY = "satya.chat.sessions.v1";

// ---- AI-derived plan suggestions ----

export type PlanSuggestion = {
  id: string;
  pillar: "Nutrition" | "Movement" | "Sleep" | "Monitoring" | "Mindset";
  text: string;
  source: string; // session id
  createdAt: number;
};

export const PLAN_KEY = "satya.plan.suggestions.v1";

const KEYWORDS: { pillar: PlanSuggestion["pillar"]; rx: RegExp }[] = [
  { pillar: "Nutrition", rx: /\b(diet|nutrition|meal|food|sugar|carb|protein|calorie|mediterranean|fiber|fasting)\b/i },
  { pillar: "Movement", rx: /\b(exercise|workout|cardio|walk|run|step|strength|resistance|zone[\s-]?2|activity)\b/i },
  { pillar: "Sleep", rx: /\b(sleep|circadian|rest|insomnia|melatonin|bedtime)\b/i },
  { pillar: "Monitoring", rx: /\b(monitor|cgm|glucose|hba1c|lab|panel|track|weigh|measure)\b/i },
  { pillar: "Mindset", rx: /\b(stress|mindful|meditation|cortisol|anxiety|habit|behaviour|behavior)\b/i },
];

export function extractSuggestionsFromText(
  text: string,
  sessionId: string,
): PlanSuggestion[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 240);

  const out: PlanSuggestion[] = [];
  const seen = new Set<string>();
  for (const s of sentences) {
    for (const k of KEYWORDS) {
      if (k.rx.test(s)) {
        const key = `${k.pillar}:${s.toLowerCase().slice(0, 60)}`;
        if (seen.has(key)) break;
        seen.add(key);
        out.push({
          id: `${sessionId}-${out.length}-${Date.now()}`,
          pillar: k.pillar,
          text: s.replace(/^[-*•\s]+/, ""),
          source: sessionId,
          createdAt: Date.now(),
        });
        break;
      }
    }
  }
  return out.slice(0, 8);
}