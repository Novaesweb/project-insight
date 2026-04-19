import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getCompatibleAdminSession } from "@/lib/admin-function-client";

const ACCESS_CHECK_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, timeoutMs = ACCESS_CHECK_TIMEOUT_MS) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Admin access check timed out."));
    }, timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      });
  });
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/admin/login");

  useEffect(() => {
    let active = true;
    let latestRunId = 0;

    const checkAccess = async () => {
      const runId = ++latestRunId;

      if (active) {
        setLoading(true);
      }

      try {
        const session = await withTimeout(
          getCompatibleAdminSession({
            allowRefresh: true,
            clearInvalidLocalSession: false,
          }),
        );

        if (!active || runId !== latestRunId) return;

        if (!session) {
          setAuthenticated(false);
          setAuthorized(false);
          setRedirectTo("/admin/login");
          return;
        }

        const sessionType = session.user.user_metadata?.tipo;
        const email = session.user.email?.trim().toLowerCase() || "";
        const { data: adminUser, error: adminUserError } = await withTimeout(
          supabase
            .from("usuarios")
            .select("id, status, bloqueado")
            .eq("email", email)
            .maybeSingle(),
        );

        if (!active || runId !== latestRunId) return;

        if (adminUserError) {
          throw adminUserError;
        }

        const isBlocked = !!adminUser?.bloqueado || adminUser?.status === "inativo";
        const isAdmin = !!adminUser;

        if (isBlocked) {
          await supabase.auth.signOut();

          if (!active || runId !== latestRunId) return;

          setAuthenticated(false);
          setAuthorized(false);
          setRedirectTo("/admin/login");
          return;
        }

        setAuthenticated(true);
        setAuthorized(isAdmin);
        setRedirectTo(sessionType === "cliente" ? "/cliente/dashboard" : "/admin/login");
      } catch (error) {
        console.error("ProtectedRoute access check failed", error);

        if (!active || runId !== latestRunId) return;

        setAuthenticated(false);
        setAuthorized(false);
        setRedirectTo("/admin/login");
      } finally {
        if (active && runId === latestRunId) {
          setLoading(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void checkAccess();
    });

    void checkAccess();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]"><span className="text-[hsl(var(--muted-foreground))]">Carregando...</span></div>;
  if (!authenticated) return <Navigate to="/admin/login" replace />;
  if (!authorized) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}



