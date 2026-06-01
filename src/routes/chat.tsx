import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Send, Sparkles, ArrowLeft, User, Bot, AlertCircle,
  Plus, Trash2, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  CHAT_KEY, PLAN_KEY, useStored,
  extractSuggestionsFromText,
  type ChatSession, type PlanSuggestion,
} from "@/lib/store";
import { AppGuard } from "@/components/obesity/AppGuard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/chat")({
  component: ChatRoute,
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

function ChatRoute() {
  return (
    <AppGuard require="view:chat">
      <ChatPage />
    </AppGuard>
  );
}

const chatTransport = new DefaultChatTransport({
  api: "/api/chat",
  headers: async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

function uiToText(m: UIMessage | undefined | null) {
  if (!m || !Array.isArray(m.parts)) return "";
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

function newSession(): ChatSession {
  const now = Date.now();
  return {
    id: `chat-${now}-${Math.random().toString(36).slice(2, 6)}`,
    title: "New conversation",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

function ChatPage() {
  const [sessions, setSessions] = useStored<ChatSession[]>(CHAT_KEY, []);
  const [, setSuggestions] = useStored<PlanSuggestion[]>(PLAN_KEY, []);
  const [activeId, setActiveId] = useState<string>(() => sessions[0]?.id ?? "");

  // ensure there's always an active session
  useEffect(() => {
    if (!activeId || !sessions.find((s) => s.id === activeId)) {
      if (sessions.length === 0) {
        const s = newSession();
        setSessions([s]);
        setActiveId(s.id);
      } else {
        setActiveId(sessions[0].id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions.length]);

  const active = sessions.find((s) => s.id === activeId);

  const { messages, setMessages, sendMessage, status, error } = useChat({
    id: activeId || "satya-chat",
    transport: chatTransport,
  });

  // Hydrate from stored session whenever active changes
  const hydratedRef = useRef<string>("");
  useEffect(() => {
    if (!active) return;
    if (hydratedRef.current === active.id) return;
    hydratedRef.current = active.id;
    setMessages(
      active.messages.map((m) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: "text", text: m.text }],
      })) as UIMessage[],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  const isLoading = status === "submitted" || status === "streaming";

  // Persist on every message change (after streaming completes)
  const lastSavedRef = useRef<string>("");
  useEffect(() => {
    if (!active || isLoading) return;
    const sig = `${active.id}:${messages.length}:${uiToText(messages[messages.length - 1] ?? ({} as UIMessage)).length}`;
    if (sig === lastSavedRef.current) return;
    lastSavedRef.current = sig;

    const firstUser = messages.find((m) => m.role === "user");
    const title = firstUser
      ? uiToText(firstUser).slice(0, 60) || "New conversation"
      : "New conversation";

    setSessions((prev) =>
      prev.map((s) =>
        s.id === active.id
          ? {
              ...s,
              title,
              updatedAt: Date.now(),
              messages: messages.map((m) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                text: uiToText(m),
                createdAt: Date.now(),
              })),
            }
          : s,
      ),
    );

    // Extract suggestions from the most recent assistant reply
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (lastAssistant) {
      const text = uiToText(lastAssistant);
      const extracted = extractSuggestionsFromText(text, active.id);
      if (extracted.length) {
        setSuggestions((prev) => {
          const seen = new Set(prev.map((p) => `${p.pillar}:${p.text}`));
          const merged = [...prev];
          for (const s of extracted) {
            const k = `${s.pillar}:${s.text}`;
            if (!seen.has(k)) {
              seen.add(k);
              merged.push(s);
            }
          }
          return merged.slice(-30);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading]);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const startNewChat = () => {
    const s = newSession();
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
    setMessages([]);
    hydratedRef.current = s.id;
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (id === activeId) {
      hydratedRef.current = "";
      setActiveId("");
    }
  };

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions],
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card/30">
        <div className="p-3 border-b border-border">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-3">
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <Button onClick={startNewChat} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-1" /> New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sortedSessions.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-4 text-center">
              No saved chats yet
            </p>
          )}
          {sortedSessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`group w-full text-left rounded-md px-2 py-2 text-sm flex items-start gap-2 transition-colors ${
                s.id === activeId ? "bg-primary/15 text-foreground" : "hover:bg-background/60 text-muted-foreground"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span className="flex-1 truncate">{s.title}</span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>
        <div className="border-t border-border p-3 text-[10px] text-muted-foreground">
          Transcripts saved on this device.
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary grid place-items-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">Satya AI</h1>
                <p className="text-xs text-muted-foreground">
                  {active?.title ?? "Obesity intelligence companion"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/plan">View plan</Link>
            </Button>
            <Button onClick={startNewChat} variant="outline" size="sm" className="md:hidden">
              <Plus className="h-3 w-3 mr-1" /> New
            </Button>
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
            const text = uiToText(message);

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
          Satya provides general health information, not medical advice. Transcripts persist locally.
        </p>
      </footer>
      </div>
    </div>
  );
}
