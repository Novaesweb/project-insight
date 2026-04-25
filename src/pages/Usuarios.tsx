import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { acessoLabel, initialAdminUserForm, useAdminUsersManager } from "@/hooks/useAdminUsersManager";
import { normalizeAdminRole, type AdminRole } from "@/lib/admin-permissions";
import { Copy, Mail, Pencil, Plus, RefreshCw, Search, ShieldCheck, ShieldOff, Trash2, UserPlus, Users } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function formatTimestamp(value?: string) {
  if (!value) return "Sem registro";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Usuarios() {
  const { toast } = useToast();
  const [showNew, setShowNew] = useState(false);
  const {
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
    deletingUser,
    setDeletingUser,
    filteredUsers,
    summary,
    userMetadata,
    fetchUsuarios,
    handleSave,
    openEditDialog,
    handleUpdateUser,
    handleToggleBlock,
    handleSendResetLink,
    handleDeleteUser,
  } = useAdminUsersManager();

  const handleCreate = async () => {
    const created = await handleSave();
    if (created) setShowNew(false);
  };

  if (loading) {
    return <div className="py-10 text-center text-white/40 text-xs">Carregando ecossistemas de usuários...</div>;
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3" variants={fadeUp}>
        {[
          { label: "Equipe total", value: summary.total, hint: "usuários internos cadastrados." },
          { label: "Ativos", value: summary.active, hint: "podem entrar no painel agora.", valueClassName: "text-emerald-400" },
          { label: "Bloqueados", value: summary.blocked, hint: "precisam de reativação manual.", valueClassName: "text-amber-400" },
          { label: "Admins", value: summary.admins, hint: "com acesso total ao painel.", valueClassName: "text-primary" },
        ].map((item) => (
          <Card key={item.label} className="glass-card border-[0.5px]">
            <CardContent className="p-5">
              <p className="text-[10px] uppercase tracking-[0.22em] font-black text-[hsl(var(--muted-foreground))]">{item.label}</p>
              <p className={`text-3xl font-black text-white mt-2 ${item.valueClassName || ""}`}>{item.value}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{item.hint}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div className="flex justify-end" variants={fadeUp}>
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-white rounded-lg">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Novo usuário admin
              </DialogTitle>
              <DialogDescription className="text-[hsl(var(--muted-foreground))]">
                A conta já sai pronta para login e entra na trilha de auditoria do painel.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {[{ key: "nome", label: "Nome completo" }, { key: "email", label: "E-mail" }, { key: "cargo", label: "Cargo" }].map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">{field.label}</Label>
                  <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={(form as never as Record<string, string>)[field.key]} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Nível de acesso</Label>
                <select className="w-full h-9 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent" value={form.acesso} onChange={(event) => setForm({ ...form, acesso: event.target.value as AdminRole })}>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="visualizador">Visualizador</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Senha inicial</Label>
                <Input type="text" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={form.senha} onChange={(event) => setForm({ ...form, senha: event.target.value })} placeholder="Mínimo 6 caracteres" />
              </div>
            </div>
            <DialogFooter className="mt-4 gap-2">
              <Button variant="ghost" onClick={() => setForm(initialAdminUserForm)}>Limpar</Button>
              <Button className="gradient-primary border-0 text-white" onClick={handleCreate} disabled={savingKey === "create-admin"}>
                {savingKey === "create-admin" ? "Criando..." : "Criar usuário"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Equipe interna
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">
                  Edição, bloqueio, redefinição de senha e histórico do último acesso
                </CardDescription>
              </div>
              <Button variant="ghost" className="h-10 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5" onClick={() => fetchUsuarios(true)} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
            <div className="flex flex-col gap-3 xl:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-10 pl-10" placeholder="Buscar por nome, e-mail, cargo ou perfil" />
              </div>
              <div className="flex flex-wrap gap-2">
                <select className="h-10 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent" value={accessFilter} onChange={(event) => setAccessFilter(event.target.value as typeof accessFilter)}>
                  <option value="todos">Todos os perfis</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="visualizador">Visualizador</option>
                </select>
                <select className="h-10 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
                  <option value="todos">Todos os status</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="bloqueado">Bloqueado</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  {["Usuário", "Cargo / Perfil", "Status", "Último acesso", "Criado por", "Ações"].map((header) => (
                    <TableHead key={header} className="text-[11px] text-[hsl(var(--muted-foreground))]">{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum usuário encontrado com os filtros atuais.</TableCell></TableRow>
                ) : filteredUsers.map((user) => {
                  const userRole = normalizeAdminRole(user.acesso);
                  const meta = userMetadata[user.email.trim().toLowerCase()];
                  return (
                    <TableRow key={user.id} className="border-[rgba(255,255,255,0.04)]">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
                            <span className="text-white text-[10px] font-bold">{user.avatar || "?"}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.nome}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">{user.cargo || "Sem cargo"}</p>
                          <Badge variant="outline" className="text-[10px] gradient-text border-[rgba(232,51,74,0.3)]">{acessoLabel[userRole]}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={user.bloqueado ? "text-[10px] border-amber-500/30 text-amber-400" : user.status === "ativo" ? "text-[10px] border-emerald-500/30 text-emerald-400" : "text-[10px] border-white/10 text-[hsl(var(--muted-foreground))]"}>
                          {user.bloqueado ? "Bloqueado" : user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[hsl(var(--muted-foreground))]"><div><p>{formatTimestamp(meta?.lastLoginAt)}</p><p className="text-white/30 mt-1">{meta?.lastLoginBy || "Sem registro"}</p></div></TableCell>
                      <TableCell className="text-xs text-[hsl(var(--muted-foreground))]"><div><p>{meta?.createdBy || "Sem histórico"}</p><p className="text-white/30 mt-1">{formatTimestamp(meta?.createdAt)}</p></div></TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-xs text-white/40 hover:text-white" onClick={() => openEditDialog(user)}><Pencil className="w-3.5 h-3.5 mr-1.5" />Editar</Button>
                          <Button variant="ghost" size="sm" className="text-xs text-white/40 hover:text-white" disabled={savingKey === `reset-${user.id}`} onClick={() => handleSendResetLink(user)}><Mail className="w-3.5 h-3.5 mr-1.5" />Reset</Button>
                          <Button variant="ghost" size="sm" className={user.bloqueado ? "text-xs text-emerald-400 hover:text-emerald-300" : "text-xs text-amber-400 hover:text-amber-300"} onClick={() => setBlockingUser(user)}>
                            {user.bloqueado ? <><ShieldCheck className="w-3.5 h-3.5 mr-1.5" />Reativar</> : <><ShieldOff className="w-3.5 h-3.5 mr-1.5" />Bloquear</>}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-rose-400 hover:text-rose-300"
                            disabled={savingKey === `delete-${user.id}`}
                            onClick={() => setDeletingUser(user)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Editar usuário admin</DialogTitle>
            <DialogDescription className="text-[hsl(var(--muted-foreground))]">
              Nome, cargo, perfil e status operacional podem ser ajustados sem recriar a conta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Nome</Label>
              <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={editForm.nome} onChange={(event) => setEditForm({ ...editForm, nome: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">E-mail vinculado</Label>
              <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white/60 text-sm h-9 opacity-70" value={editingUser?.email || ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Cargo</Label>
              <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" value={editForm.cargo} onChange={(event) => setEditForm({ ...editForm, cargo: event.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Perfil</Label>
                <select className="w-full h-9 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent" value={editForm.acesso} onChange={(event) => setEditForm({ ...editForm, acesso: event.target.value as AdminRole })}>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="visualizador">Visualizador</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Status</Label>
                <select className="w-full h-9 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent" value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="ghost" onClick={() => setEditingUser(null)}>Cancelar</Button>
            <Button className="gradient-primary border-0 text-white" onClick={handleUpdateUser} disabled={savingKey === `update-${editingUser?.id}`}>
              {savingKey === `update-${editingUser?.id}` ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!blockingUser} onOpenChange={(open) => !open && setBlockingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{blockingUser?.bloqueado ? "Reativar usuário" : "Bloquear usuário"}</AlertDialogTitle>
            <AlertDialogDescription>
              {blockingUser?.bloqueado ? "Esse usuário volta a poder entrar no painel administrativo." : "Esse usuário perde o acesso ao painel até ser reativado manualmente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleBlock}>
              {blockingUser?.bloqueado ? "Reativar acesso" : "Bloquear acesso"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuÃ¡rio</AlertDialogTitle>
            <AlertDialogDescription>
              Essa aÃ§Ã£o remove o usuÃ¡rio interno e o acesso de login do painel administrativo. NÃ£o pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-rose-500 text-white hover:bg-rose-600"
            >
              {savingKey === `delete-${deletingUser?.id}` ? "Excluindo..." : "Confirmar exclusÃ£o"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!contaCriada} onOpenChange={() => setContaCriada(null)}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Conta criada com sucesso
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Compartilhe os dados abaixo para a pessoa acessar o painel administrativo:</p>
            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] space-y-3">
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Link do painel</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white font-mono flex-1 truncate">{contaCriada?.link}</p>
                  <Button size="sm" variant="ghost" className="text-white/50 h-7" onClick={() => { navigator.clipboard.writeText(contaCriada?.link || ""); toast({ title: "Link copiado!" }); }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">E-mail</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white flex-1">{contaCriada?.email}</p>
                  <Button size="sm" variant="ghost" className="text-white/50 h-7" onClick={() => { navigator.clipboard.writeText(contaCriada?.email || ""); toast({ title: "E-mail copiado!" }); }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Senha inicial</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white font-mono">{contaCriada?.senha}</p>
                  <Button size="sm" variant="ghost" className="text-white/50 h-7" onClick={() => { navigator.clipboard.writeText(contaCriada?.senha || ""); toast({ title: "Senha copiada!" }); }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Button className="gradient-primary border-0 text-white w-full" onClick={() => setContaCriada(null)}>Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
