import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  ArrowLeft,
  User,
  Bot,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  head: () => ({
    meta: [
      { title: "Satya AI — Ask about obesity & health" },
      {
        name: "description",
        content:
          "Chat with Satya, your AI obesity intelligence companion. Ask about nutrition, exercise, sleep, diabetes prevention, and metabolic health.",
      },
    ],
  }),
});

const chatTransport = new DefaultChatTransport({ api: "/api/chat" });

function ChatPage() {
  const { messages, sendMessage, status, error } = useChat({
    id: "satya-chat",
    transport: chatTransport,
  });

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary grid place-items-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">Satya AI</h1>
                <p className="text-xs text-muted-foreground">
                  Obesity intelligence companion
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${isLoading ? "bg-accent animate-pulse" : "bg-primary"}`}
            />
            <span className="text-xs text-muted-foreground">
              {isLoading ? "Thinking..." : "Online"}
            </span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <Card className="bg-card border-border p-6 text-center">
              <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary grid place-items-center mx-auto mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold mb-2">
                Ask Satya anything about your health
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                Get evidence-based answers on obesity risk, nutrition, exercise,
                sleep, diabetes prevention, and metabolic wellness.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "What BMI range is healthy?",
                  "How does sleep affect weight?",
                  "Best exercises for insulin resistance?",
                  "What is a safe weight loss rate?",
                ].map((q) => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      sendMessage({ text: q });
                    }}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {messages.map((message) => {
            const isUser = message.role === "user";
            const text = message.parts
              .map((part) => (part.type === "text" ? part.text : ""))
              .join("");

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`h-8 w-8 shrink-0 rounded-lg grid place-items-center ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/15 text-primary"
                  }`}
                >
                  {isUser ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground"
                  }`}
                >
                  {text}
                </div>
              </div>
            );
          })}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                {error.message || "Something went wrong. Please try again."}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm sticky bottom-0">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-3xl px-4 py-3 flex items-end gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about obesity, nutrition, exercise, sleep..."
            className="min-h-[44px] max-h-[160px] resize-none flex-1 bg-background"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-[44px] w-[44px] shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-center text-[10px] text-muted-foreground pb-2">
          Satya provides general health information, not medical advice.
        </p>
      </footer>
    </div>
  );
}
