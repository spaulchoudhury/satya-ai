import { useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { can, useAuth, type Capability } from "@/lib/auth";
import { TopBar } from "./TopBar";
import { ShieldCheck } from "lucide-react";

export function AppGuard({
  children,
  require,
}: {
  children: React.ReactNode;
  require?: Capability;
}) {
  const { ready, user } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (ready && !user) {
      navigate({ to: "/login", search: { redirect: loc.pathname } });
    }
  }, [ready, user, navigate, loc.pathname]);

  if (!ready || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-muted-foreground text-sm">
        Authenticating…
      </div>
    );
  }

  if (require && !can(user.role, require)) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <TopBar />
        <div className="grid place-items-center py-32 px-6">
          <div className="text-center max-w-md">
            <div className="mx-auto h-14 w-14 rounded-xl bg-destructive/15 text-destructive grid place-items-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-2xl font-bold">Access restricted</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your role does not have permission to view this page. This action has
              been logged for compliance review.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TopBar />
      {children}
    </>
  );
}