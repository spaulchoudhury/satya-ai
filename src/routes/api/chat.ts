import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
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
