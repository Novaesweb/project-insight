/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
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
  isOwnerAdminEmail,
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
import { getCachedAdminUser, setCachedAdminUser } from "@/lib/admin-cache";

const ADMIN_ACCESS_TIMEOUT_MS = 8000;
const MIN_REFRESH_INTERVAL_MS = 30000; // 30s throttle for background refreshes
let lastGlobalRefreshAt = 0;

function withTimeout<T>(promise: Promise<T> | PromiseLike<T>, timeoutMs = ADMIN_ACCESS_TIMEOUT_MS) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Admin permission check timed out."));
    }, timeoutMs);

    Promise.resolve(promise)
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

  const resetAccessState = useCallback(() => {
    setCurrentUser(null);
    setSessionEmail(null);
    setRole("visualizador");
    setPermissions(DEFAULT_ADMIN_PERMISSIONS);
    setUserMetadata({});
  }, []);

  const latestRunIdRef = useRef(0);

  const refresh = useCallback(async ({ showLoading = true, force = false }: { showLoading?: boolean; force?: boolean } = {}) => {
    const runId = ++latestRunIdRef.current;
    const now = Date.now();

    // Throttle background refreshes unless forced or showing loading
    if (!force && !showLoading && now - lastGlobalRefreshAt < MIN_REFRESH_INTERVAL_MS) {
      return;
    }

    if (showLoading) {
      setLoading(true);
    }

    try {
      const session = await withTimeout(
        getCompatibleAdminSession({
          allowRefresh: true,
          clearInvalidLocalSession: false,
        }),
      );

      if (!session) {
        resetAccessState();
        return;
      }

      const email = session.user.email?.trim().toLowerCase() || null;
      const ownerOverride = isOwnerAdminEmail(email);
      setSessionEmail(email);

      // Check cache for user info
      const cachedUser = email ? getCachedAdminUser(email) : undefined;
      let usuario: Tables<"usuarios"> | null = cachedUser ?? null;
      let needsUserFetch = cachedUser === undefined || force;

      const activeCachedUser =
        cachedUser && cachedUser.status === "ativo" && !cachedUser.bloqueado ? cachedUser : null;
      const cachedRole = activeCachedUser?.acesso ? normalizeAdminRole(activeCachedUser.acesso) : null;

      if (showLoading && activeCachedUser && (cachedRole === "admin" || ownerOverride)) {
        setCurrentUser(activeCachedUser);
        setRole("admin");
        setLoading(false);
      }

      const queries: Promise<any>[] = [
        supabase
          .from("app_config")
          .select("key, value")
          .in("key", ["admin_permissions", ADMIN_USER_METADATA_KEY]),
      ];

      if (needsUserFetch && email) {
        queries.push(supabase.from("usuarios").select("*").eq("email", email).maybeSingle());
      }

      const [configResponse, userResponse] = await withTimeout(Promise.all(queries));

      if (!configResponse.error && configResponse.data) {
        const permissionRow = configResponse.data.find((row) => row.key === "admin_permissions");
        const userMetadataRow = configResponse.data.find((row) => row.key === ADMIN_USER_METADATA_KEY);
        setPermissions(parsePermissionsConfig(permissionRow?.value));
        setUserMetadata(parseAdminUserMetadata(userMetadataRow?.value));
      }

      if (needsUserFetch) {
        if (userResponse?.error) throw userResponse.error;
        usuario = userResponse?.data || null;
        if (email) setCachedAdminUser(email, usuario);
      }

      lastGlobalRefreshAt = Date.now();

      const activeInternalUser =
        usuario && usuario.status === "ativo" && !usuario.bloqueado ? usuario : null;

      setCurrentUser(activeInternalUser);

      if (ownerOverride) {
        setRole("admin");
      } else if (activeInternalUser?.acesso) {
        setRole(normalizeAdminRole(activeInternalUser.acesso));
      } else {
        setRole("visualizador");
      }
    } catch (error) {
      console.error("Admin access refresh failed", error);
      resetAccessState();
    } finally {
      if (runId === latestRunIdRef.current) {
        setLoading(false);
      }
    }
  }, [resetAccessState]);

  useEffect(() => {
    void refresh({ showLoading: true });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
        return;
      }

      if (event === "SIGNED_OUT" || !session) {
        resetAccessState();
        setLoading(false);
        return;
      }

      void refresh({ showLoading: false });
    });

    return () => subscription.unsubscribe();
  }, [refresh, resetAccessState]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = () => {
      void refresh({ showLoading: false });
    };

    window.addEventListener("admin-access-refresh", handler);
    return () => window.removeEventListener("admin-access-refresh", handler);
  }, [refresh]);

  const value = useMemo<AdminAccessContextValue>(() => {
    const ownerOverride = isOwnerAdminEmail(sessionEmail);
    const canAccessRoute = (pathname: string) =>
      ownerOverride ? pathname.startsWith("/admin") : canAccessPath(role, permissions, pathname);
    const canAccessModuleKey = (moduleKey?: AdminPermissionKey | null) =>
      ownerOverride ? true : moduleKey ? permissions[moduleKey]?.[role] ?? false : true;

    return {
      loading,
      currentUser,
      sessionEmail,
      role: ownerOverride ? "admin" : role,
      permissions,
      userMetadata,
      canAccessPath: canAccessRoute,
      canAccessModule: canAccessModuleKey,
      allowedRoutes: ownerOverride ? adminRoutes : adminRoutes.filter((route) => canAccessRoute(route.href)),
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
