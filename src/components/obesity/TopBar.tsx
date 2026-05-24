import { Link } from "@tanstack/react-router";
import { LogOut, ShieldCheck, Sparkles, Compass } from "lucide-react";
import { logout, ROLE_LABEL, useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TopBar() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="border-b border-border bg-card/40 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-2 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 text-xs tracking-[0.3em] text-primary">
          <Sparkles className="h-3 w-3" /> SATYA
        </Link>
        <div className="flex items-center gap-3 text-xs">
          <Link to="/strategy" className="hidden md:inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
            <Compass className="h-3 w-3" /> Strategy
          </Link>
          <Badge variant="outline" className="border-primary/40 text-primary">
            <ShieldCheck className="h-3 w-3 mr-1" /> {ROLE_LABEL[user.role]}
          </Badge>
          <span className="hidden sm:inline text-muted-foreground">{user.name}</span>
          <Button size="sm" variant="ghost" onClick={logout} className="h-7">
            <LogOut className="h-3 w-3 mr-1" /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}