import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { invokeAdminFunction } from "@/lib/admin-function-client";
import {
  logAdminAudit,
  loadAdminUserMetadata,
  updateAdminUserMetadata,
  type AdminUserMetadataMap,
} from "@/lib/admin-audit";
import { normalizeAdminRole, type AdminRole } from "@/lib/admin-permissions";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

export type AdminUser = Tables<"usuarios">;

export const initialAdminUserForm = {
  nome: "",
  email: "",
  cargo: "",
  acesso: "editor" as AdminRole,
  senha: "",
};

export const acessoLabel: Record<AdminRole, string> = {
  admin: "Admin",
  editor: "Editor",
  visualizador: "Visualizador",
};

export function useAdminUsersManager() {
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<AdminUser[]>([]);
  const [userMetadata, setUserMetadata] = useState<AdminUserMetadataMap>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [actorEmail, setActorEmail] = useState("admin@novaesweb");
  const [search, setSearch] = useState("");
  const [accessFilter, setAccessFilter] = useState<"todos" | AdminRole>("todos");
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "inativo" | "bloqueado">("todos");
  const [form, setForm] = useState(initialAdminUserForm);
  const [contaCriada, setContaCriada] = useState<{ email: string; senha: string; link: string } | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ nome: "", cargo: "", acesso: "editor" as AdminRole, status: "ativo" });
  const [blockingUser, setBlockingUser] = useState<AdminUser | null>(null);

  const fetchUsuarios = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setLoading(!isRefresh);

    const [usersResponse, metadataResponse, sessionResponse] = await Promise.all([
      supabase.from("usuarios").select("*").order("created_at", { ascending: false }),
      loadAdminUserMetadata(),
      supabase.auth.getSession(),
    ]);

    if (usersResponse.error) {
      toast({ title: "Erro ao carregar usuários", description: usersResponse.error.message, variant: "destructive" });
    } else {
      setUsuarios((usersResponse.data || []) as AdminUser[]);
    }

    setUserMetadata(metadataResponse);
    setActorEmail(sessionResponse.data.session?.user?.email?.trim().toLowerCase() || "admin@novaesweb");
    setLoading(false);
    setRefreshing(false);
  }, [toast]);

  useEffect(() => {
    void fetchUsuarios();
  }, [fetchUsuarios]);

  useRealtimeRefresh(
    [
      { table: "usuarios" },
      { table: "app_config" },
    ],
    () => fetchUsuarios(true),
    { channelPrefix: "admin-usuarios" },
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return usuarios.filter((user) => {
      const role = normalizeAdminRole(user.acesso);
      const matchesSearch = !query || [user.nome, user.email, user.cargo || "", role].join(" ").toLowerCase().includes(query);
      const matchesAccess = accessFilter === "todos" || role === accessFilter;
      const currentStatus = user.bloqueado ? "bloqueado" : user.status;
      const matchesStatus = statusFilter === "todos" || currentStatus === statusFilter;
      return matchesSearch && matchesAccess && matchesStatus;
    });
  }, [accessFilter, search, statusFilter, usuarios]);

  const summary = useMemo(
    () => ({
      total: usuarios.length,
      active: usuarios.filter((user) => !user.bloqueado && user.status === "ativo").length,
      blocked: usuarios.filter((user) => user.bloqueado).length,
      admins: usuarios.filter((user) => normalizeAdminRole(user.acesso) === "admin").length,
    }),
    [usuarios]
  );

  const handleSave = async () => {
    const email = form.email.trim().toLowerCase();

    if (!form.nome || !email || !form.cargo || form.senha.length < 6) {
      toast({
        title: "Preencha todos os campos",
        description: "Nome, e-mail, cargo e senha com no mínimo 6 caracteres são obrigatórios.",
        variant: "destructive",
      });
      return false;
    }

    setSavingKey("create-admin");
    const avatar = form.nome.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();
    try {
      await invokeAdminFunction("create-account", {
        body: { email, password: form.senha, nome: form.nome, tipo: "admin" },
        returnTo: "/admin/usuarios",
        source: "admin-users-create",
        fallbackMessage: "Não foi possível provisionar o acesso administrativo.",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar conta",
        description: error instanceof Error ? error.message : "Não foi possível criar a conta administrativa.",
        variant: "destructive",
      });
      setSavingKey(null);
      return false;
    }

    const { error } = await supabase.from("usuarios").insert({
      nome: form.nome,
      email,
      cargo: form.cargo,
      acesso: form.acesso,
      avatar,
      status: "ativo",
      bloqueado: false,
      tentativas_login: 0,
    });

    if (error) {
      toast({ title: "Conta criada, mas erro ao salvar usuário", description: error.message, variant: "destructive" });
      setSavingKey(null);
      return false;
    }

    const now = new Date().toISOString();
    const nextMetadata = await updateAdminUserMetadata(email, {
      createdAt: now,
      createdBy: actorEmail,
      lastUpdatedAt: now,
      lastUpdatedBy: actorEmail,
    });
    setUserMetadata(nextMetadata);
    await logAdminAudit("Usuário admin criado", `${actorEmail} criou ${form.nome} (${email}) com perfil ${acessoLabel[form.acesso]}.`, "/admin/usuarios");

    setContaCriada({ email, senha: form.senha, link: `${window.location.origin}/admin/login` });
    setForm(initialAdminUserForm);
    setSavingKey(null);
    await fetchUsuarios(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("admin-access-refresh"));
    }
    toast({ title: "Usuário criado com sucesso!" });
    return true;
  };

  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      nome: user.nome,
      cargo: user.cargo || "",
      acesso: normalizeAdminRole(user.acesso),
      status: user.status,
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setSavingKey(`update-${editingUser.id}`);
    const { error } = await supabase
      .from("usuarios")
      .update({
        nome: editForm.nome,
        cargo: editForm.cargo,
        acesso: editForm.acesso,
        status: editForm.status,
      })
      .eq("id", editingUser.id);

    if (error) {
      toast({ title: "Erro ao atualizar usuário", description: error.message, variant: "destructive" });
      setSavingKey(null);
      return;
    }

    const nextMetadata = await updateAdminUserMetadata(editingUser.email, {
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedBy: actorEmail,
    });
    setUserMetadata(nextMetadata);
    await logAdminAudit(
      "Usuário admin atualizado",
      `${actorEmail} atualizou ${editForm.nome} (${editingUser.email}) para o perfil ${acessoLabel[editForm.acesso]}.`,
      "/admin/usuarios"
    );

    setEditingUser(null);
    setSavingKey(null);
    await fetchUsuarios(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("admin-access-refresh"));
    }
    toast({ title: "Usuário atualizado" });
  };

  const handleToggleBlock = async () => {
    if (!blockingUser) return;

    if (blockingUser.email === actorEmail) {
      toast({
        title: "Ação não permitida",
        description: "Você não pode bloquear o próprio acesso por aqui.",
        variant: "destructive",
      });
      setBlockingUser(null);
      return;
    }

    const nextBlocked = !blockingUser.bloqueado;
    setSavingKey(`block-${blockingUser.id}`);
    const { error } = await supabase
      .from("usuarios")
      .update({
        bloqueado: nextBlocked,
        status: nextBlocked ? "inativo" : "ativo",
        tentativas_login: 0,
      })
      .eq("id", blockingUser.id);

    if (error) {
      toast({ title: "Erro ao alterar status", description: error.message, variant: "destructive" });
      setSavingKey(null);
      return;
    }

    const now = new Date().toISOString();
    const nextMetadata = await updateAdminUserMetadata(
      blockingUser.email,
      nextBlocked
        ? { blockedAt: now, blockedBy: actorEmail, lastUpdatedAt: now, lastUpdatedBy: actorEmail }
        : { reactivatedAt: now, reactivatedBy: actorEmail, lastUpdatedAt: now, lastUpdatedBy: actorEmail }
    );
    setUserMetadata(nextMetadata);
    await logAdminAudit(
      nextBlocked ? "Usuário admin bloqueado" : "Usuário admin reativado",
      `${actorEmail} ${nextBlocked ? "bloqueou" : "reativou"} ${blockingUser.nome} (${blockingUser.email}).`,
      "/admin/usuarios"
    );

    setBlockingUser(null);
    setSavingKey(null);
    await fetchUsuarios(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("admin-access-refresh"));
    }
    toast({ title: nextBlocked ? "Usuário bloqueado" : "Usuário reativado" });
  };

  const handleSendResetLink = async (user: AdminUser) => {
    setSavingKey(`reset-${user.id}`);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (error) {
      toast({ title: "Erro ao enviar redefinição", description: error.message, variant: "destructive" });
      setSavingKey(null);
      return;
    }

    const now = new Date().toISOString();
    const nextMetadata = await updateAdminUserMetadata(user.email, {
      passwordResetAt: now,
      passwordResetBy: actorEmail,
      lastUpdatedAt: now,
      lastUpdatedBy: actorEmail,
    });
    setUserMetadata(nextMetadata);
    await logAdminAudit(
      "Link de redefinição enviado",
      `${actorEmail} enviou uma redefinição de senha para ${user.nome} (${user.email}).`,
      "/admin/usuarios"
    );

    setSavingKey(null);
    toast({ title: "Link enviado", description: "A redefinição de senha foi enviada por e-mail." });
  };

  return {
    usuarios,
    userMetadata,
    loading,
    refreshing,
    savingKey,
    search,
    setSearch,
    accessFilter,
    setAccessFilter,
    statusFilter,
    setStatusFilter,
    form,
    setForm,
    contaCriada,
    setContaCriada,
    editingUser,
    setEditingUser,
    editForm,
    setEditForm,
    blockingUser,
    setBlockingUser,
    filteredUsers,
    summary,
    fetchUsuarios,
    handleSave,
    openEditDialog,
    handleUpdateUser,
    handleToggleBlock,
    handleSendResetLink,
  };
}
