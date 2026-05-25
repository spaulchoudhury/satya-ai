import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

type ChatRequestBody = { messages?: unknown };

const MAX_MESSAGES = 50;
const MAX_TEXT_LEN = 8000;
const MAX_BODY_BYTES = 64 * 1024;

function totalTextLength(messages: UIMessage[]): number {
  let total = 0;
  for (const m of messages) {
    if (!Array.isArray(m?.parts)) continue;
    for (const p of m.parts) {
      if (p?.type === "text" && typeof p.text === "string") total += p.text.length;
      if (total > MAX_TEXT_LEN) return total;
    }
  }
  return total;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        // Hard byte cap before parsing
        const contentLength = Number(request.headers.get("content-length") ?? "0");
        if (contentLength && contentLength > MAX_BODY_BYTES) {
          return new Response("Payload too large", { status: 413 });
        }

        // Authn: require a valid Supabase bearer token
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice("Bearer ".length).trim();
        if (!token) {
          return new Response("Unauthorized", { status: 401 });
        }

        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Server misconfigured", { status: 500 });
        }
        const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });
        const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
        if (claimsError || !claimsData?.claims?.sub) {
          return new Response("Unauthorized", { status: 401 });
        }

        const rawBody = await request.text();
        if (rawBody.length > MAX_BODY_BYTES) {
          return new Response("Payload too large", { status: 413 });
        }
        let parsed: ChatRequestBody;
        try {
          parsed = JSON.parse(rawBody) as ChatRequestBody;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const { messages } = parsed;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        if (messages.length === 0 || messages.length > MAX_MESSAGES) {
          return new Response("Invalid message count", { status: 400 });
        }
        // Reject any non-text parts
        for (const m of messages as UIMessage[]) {
          if (!Array.isArray(m?.parts)) {
            return new Response("Invalid message format", { status: 400 });
          }
          for (const p of m.parts) {
            if (p?.type !== "text" || typeof (p as { text?: unknown }).text !== "string") {
              return new Response("Only text message parts are allowed", { status: 400 });
            }
          }
        }
        if (totalTextLength(messages as UIMessage[]) > MAX_TEXT_LEN) {
          return new Response("Payload too large", { status: 413 });
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
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
