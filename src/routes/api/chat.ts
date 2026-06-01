import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import "@tanstack/react-start";

type ChatRequestBody = { messages?: unknown };

const MAX_BODY_BYTES = 64 * 1024;        // 64 KB
const MAX_MESSAGES = 50;
const MAX_TEXT_PER_MSG = 8_000;

function isValidMessages(msgs: unknown): msgs is UIMessage[] {
  if (!Array.isArray(msgs) || msgs.length === 0 || msgs.length > MAX_MESSAGES) return false;
  for (const m of msgs) {
    if (!m || typeof m !== "object") return false;
    const mm = m as { role?: unknown; parts?: unknown };
    if (mm.role !== "user" && mm.role !== "assistant" && mm.role !== "system") return false;
    if (!Array.isArray(mm.parts)) return false;
    let total = 0;
    for (const p of mm.parts) {
      if (!p || typeof p !== "object") return false;
      const pp = p as { type?: unknown; text?: unknown };
      if (pp.type !== "text" || typeof pp.text !== "string") return false;
      total += pp.text.length;
      if (total > MAX_TEXT_PER_MSG) return false;
    }
  }
  return true;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        // Auth: require Supabase Bearer token
        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnon = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!supabaseUrl || !supabaseAnon) {
          return new Response("Server misconfigured", { status: 500 });
        }
        const sb = createClient(supabaseUrl, supabaseAnon);
        const { data: userData, error: userErr } = await sb.auth.getUser(token);
        if (userErr || !userData?.user) {
          return new Response("Unauthorized", { status: 401 });
        }

        // Size cap
        const contentLength = Number(request.headers.get("content-length") ?? "0");
        if (contentLength && contentLength > MAX_BODY_BYTES) {
          return new Response("Payload too large", { status: 413 });
        }
        const raw = await request.text();
        if (raw.length > MAX_BODY_BYTES) {
          return new Response("Payload too large", { status: 413 });
        }

        let parsed: ChatRequestBody;
        try {
          parsed = JSON.parse(raw) as ChatRequestBody;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const { messages } = parsed;
        if (!isValidMessages(messages)) {
          return new Response("Invalid messages payload", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system:
            "You are Satya, an AI-powered obesity intelligence companion. You help users understand obesity risk factors, prevention strategies, nutrition, exercise, sleep, and metabolic health. You provide evidence-based, compassionate guidance. You are not a substitute for medical advice — always remind users to consult healthcare professionals for personalized diagnosis and treatment. Keep responses concise, actionable, and supportive. You can discuss topics like BMI interpretation, healthy weight loss rates, insulin resistance, diabetes prevention, meal planning, workout recommendations, and sleep hygiene.",
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
        });
      },
    },
  },
});
