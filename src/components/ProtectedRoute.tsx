import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getCompatibleAdminSession } from "@/lib/admin-function-client";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/admin/login");

  useEffect(() => {
    const checkAccess = async () => {
      const session = await getCompatibleAdminSession();

      if (!session) {
        setAuthenticated(false);
        setAuthorized(false);
        setRedirectTo("/admin/login");
        setLoading(false);
        return;
      }

      const sessionType = session.user.user_metadata?.tipo;
      const email = session.user.email?.trim().toLowerCase() || "";
      const { data: adminUser } = await supabase
        .from("usuarios")
        .select("id, status, bloqueado")
        .eq("email", email)
        .maybeSingle();

      const isBlocked = !!adminUser?.bloqueado || adminUser?.status === "inativo";
      const isAdmin = !!adminUser;

      if (isBlocked) {
        await supabase.auth.signOut();
        setAuthenticated(false);
        setAuthorized(false);
        setRedirectTo("/admin/login");
        setLoading(false);
        return;
      }

      setAuthenticated(true);
      setAuthorized(isAdmin);
      setRedirectTo(sessionType === "cliente" ? "/cliente/dashboard" : "/admin/login");
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void checkAccess();
    });

    void checkAccess();

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]"><span className="text-[hsl(var(--muted-foreground))]">Carregando...</span></div>;
  if (!authenticated) return <Navigate to="/admin/login" replace />;
  if (!authorized) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}



