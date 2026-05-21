import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, ShieldCheck, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DEMO_ACCOUNTS, ROLE_LABEL, ROLE_BLURB,
  loginAs, useAuth, type AuthUser,
} from "@/lib/auth";

type Search = { redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — Satya" },
      { name: "description", content: "Role-based sign-in for Satya obesity intelligence." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function LoginPage() {
  const { user } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate({ to: (redirect as "/") ?? "/" });
  }, [user, redirect, navigate]);

  const pickPersona = (u: AuthUser) => {
    loginAs(u);
    navigate({ to: (redirect as "/") ?? "/" });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!match) { setErr("No account found for that email."); return; }
    if (password.length < 4) { setErr("Password must be at least 4 characters."); return; }
    pickPersona(match);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center gap-2 text-xs tracking-[0.3em] text-primary">
          <Sparkles className="h-3 w-3" /> SATYA · SECURE SIGN-IN
        </div>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">
          Role-based access to <span className="text-primary italic">protected health data</span>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl text-sm">
          Satya enforces least-privilege access. PHI is masked or anonymised based on
          your role to stay compliant with HIPAA / GDPR confidentiality requirements.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2 bg-card border-border p-6">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Sign in with email</h2>
            </div>
            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email" autoComplete="username"
                  placeholder="you@clinic.demo"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password" autoComplete="current-password"
                  placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {err && (
                <p className="text-xs text-destructive">{err}</p>
              )}
              <Button type="submit" className="w-full" size="lg">Sign in</Button>
              <p className="text-[11px] text-muted-foreground">
                Prototype only. No real credentials are stored or transmitted.
              </p>
            </form>
          </Card>

          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Or continue as a demo persona</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => pickPersona(u)}
                  className="text-left rounded-lg border border-border bg-card hover:border-primary/60 transition-colors p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
                      {ROLE_LABEL[u.role]}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{u.email}</span>
                  </div>
                  <div className="mt-3 font-semibold">{u.name}</div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {ROLE_BLURB[u.role]}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-16 text-center text-[11px] text-muted-foreground">
          Satya · Confidential health data · RBAC enforced
        </footer>
      </div>
    </div>
  );
}