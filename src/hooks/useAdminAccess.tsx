/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { getCompatibleAdminSession } from "@/lib/admin-function-client";
import { adminRoutes } from "@/lib/admin-navigation";
import {
  DEFAULT_ADMIN_PERMISSIONS,
  canAccessPath,
  getModuleForPath,
  normalizeAdminRole,
  parsePermissionsConfig,
  type AdminPermissionKey,
  type AdminPermissionsConfig,
  type AdminRole,
} from "@/lib/admin-permissions";
import {
  ADMIN_USER_METADATA_KEY,
  parseAdminUserMetadata,
  type AdminUserMetadataMap,
} from "@/lib/admin-audit";

interface AdminAccessContextValue {
  loading: boolean;
  currentUser: Tables<"usuarios"> | null;
  sessionEmail: string | null;
  role: AdminRole;
  permissions: AdminPermissionsConfig;
  userMetadata: AdminUserMetadataMap;
  canAccessPath: (pathname: string) => boolean;
  canAccessModule: (moduleKey?: AdminPermissionKey | null) => boolean;
  allowedRoutes: typeof adminRoutes;
  refresh: () => Promise<void>;
}

const AdminAccessContext = createContext<AdminAccessContextValue | null>(null);

export function AdminAccessProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Tables<"usuarios"> | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [role, setRole] = useState<AdminRole>("visualizador");
  const [permissions, setPermissions] = useState<AdminPermissionsConfig>(DEFAULT_ADMIN_PERMISSIONS);
  const [userMetadata, setUserMetadata] = useState<AdminUserMetadataMap>({});

  const refresh = useCallback(async () => {
    setLoading(true);

    const session = await getCompatibleAdminSession();

    if (!session) {
      setCurrentUser(null);
      setSessionEmail(null);
      setRole("visualizador");
      setPermissions(DEFAULT_ADMIN_PERMISSIONS);
      setUserMetadata({});
      setLoading(false);
      return;
    }

    const email = session.user.email?.trim().toLowerCase() || null;
    setSessionEmail(email);

    const [configResponse, userResponse] = await Promise.all([
      supabase
        .from("app_config")
        .select("key, value")
        .in("key", ["admin_permissions", ADMIN_USER_METADATA_KEY]),
      email
        ? supabase.from("usuarios").select("*").eq("email", email).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (!configResponse.error && configResponse.data) {
      const permissionRow = configResponse.data.find((row) => row.key === "admin_permissions");
      const userMetadataRow = configResponse.data.find((row) => row.key === ADMIN_USER_METADATA_KEY);
      setPermissions(parsePermissionsConfig(permissionRow?.value));
      setUserMetadata(parseAdminUserMetadata(userMetadataRow?.value));
    } else {
      setPermissions(DEFAULT_ADMIN_PERMISSIONS);
      setUserMetadata({});
    }

    const usuario = userResponse?.data || null;
    const activeInternalUser =
      usuario && usuario.status === "ativo" && !usuario.bloqueado ? usuario : null;

    setCurrentUser(activeInternalUser);

    if (activeInternalUser?.acesso) {
      setRole(normalizeAdminRole(activeInternalUser.acesso));
    } else {
      setRole("visualizador");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = () => {
      void refresh();
    };

    window.addEventListener("admin-access-refresh", handler);
    return () => window.removeEventListener("admin-access-refresh", handler);
  }, [refresh]);

  const value = useMemo<AdminAccessContextValue>(() => {
    const canAccessRoute = (pathname: string) => canAccessPath(role, permissions, pathname);
    const canAccessModuleKey = (moduleKey?: AdminPermissionKey | null) =>
      moduleKey ? permissions[moduleKey]?.[role] ?? false : true;

    return {
      loading,
      currentUser,
      sessionEmail,
      role,
      permissions,
      userMetadata,
      canAccessPath: canAccessRoute,
      canAccessModule: canAccessModuleKey,
      allowedRoutes: adminRoutes.filter((route) => canAccessRoute(route.href)),
      refresh,
    };
  }, [currentUser, loading, permissions, refresh, role, sessionEmail, userMetadata]);

  return <AdminAccessContext.Provider value={value}>{children}</AdminAccessContext.Provider>;
}

export function useAdminAccess() {
  const context = useContext(AdminAccessContext);

  if (!context) {
    throw new Error("useAdminAccess must be used inside AdminAccessProvider");
  }

  return context;
}

export function useCurrentAdminModule(pathname: string) {
  const { canAccessModule } = useAdminAccess();
  const moduleKey = getModuleForPath(pathname);

  return {
    moduleKey,
    canAccess: canAccessModule(moduleKey),
  };
}
