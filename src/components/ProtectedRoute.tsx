import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getCompatibleAdminSession } from "@/lib/admin-function-client";
import { getCachedAdminUser, setCachedAdminUser, clearAdminCache } from "@/lib/admin-cache";

const ACCESS_CHECK_TIMEOUT_MS = 8000;
const MIN_RECHECK_INTERVAL_MS = 30000; // Only force re-fetch from DB every 30s max
let lastCheckAt = 0;

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

    const resetToLogin = () => {
      setAuthenticated(false);
      setAuthorized(false);
      setRedirectTo("/admin/login");
      clearAdminCache();
    };

    const checkAccess = async ({ showLoading = false, force = false }: { showLoading?: boolean; force?: boolean } = {}) => {
      const runId = ++latestRunId;
      const now = Date.now();

      if (active && showLoading) {
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
          resetToLogin();
          return;
        }

        const email = session.user.email?.trim().toLowerCase() || "";
        const sessionType = session.user.user_metadata?.tipo;
        
        // Try cache first unless forced
        const cachedUser = getCachedAdminUser(email);
        let adminUser = cachedUser;
        let isFromCache = cachedUser !== undefined;

        if (!isFromCache || force || now - lastCheckAt > MIN_RECHECK_INTERVAL_MS) {
          const { data, error: adminUserError } = await withTimeout(
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

          adminUser = data as any;
          setCachedAdminUser(email, adminUser as any);
          lastCheckAt = Date.now();
        }

        const isBlocked = !!adminUser?.bloqueado || adminUser?.status === "inativo";
        const isAdmin = !!adminUser;

        if (isBlocked) {
          clearAdminCache();
          await supabase.auth.signOut();

          if (!active || runId !== latestRunId) return;

          resetToLogin();
          return;
        }

        setAuthenticated(true);
        setAuthorized(isAdmin);
        setRedirectTo(sessionType === "cliente" ? "/cliente/dashboard" : "/admin/login");
      } catch (error) {
        console.error("ProtectedRoute access check failed", error);

        if (!active || runId !== latestRunId) return;

        resetToLogin();
      } finally {
        if (active && runId === latestRunId) {
          setLoading(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
        return;
      }

      if (event === "SIGNED_OUT" || !session) {
        resetToLogin();
        setLoading(false);
        return;
      }

      // On sign-in, force a re-check
      void checkAccess({ showLoading: false, force: event === "SIGNED_IN" });
    });

    void checkAccess({ showLoading: true });

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



