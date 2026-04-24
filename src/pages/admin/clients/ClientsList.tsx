import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building,
  Mail,
  Phone,
  Search,
  Users,
  UserPlus,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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
import { useToast } from "@/hooks/use-toast";
import { useClients } from "@/features/clients/hooks/useClients";
import { type Client } from "@/features/clients/services/client-service";
import { cn } from "@/lib/utils";

type ClientFormState = {
  nome: string;
  nome_empresa: string;
  email: string;
  whatsapp: string;
  telefone: string;
  documento: string;
  cidade: string;
  estado: string;
  endereco: string;
  site_url: string;
};

const emptyForm: ClientFormState = {
  nome: "",
  nome_empresa: "",
  email: "",
  whatsapp: "",
  telefone: "",
  documento: "",
  cidade: "",
  estado: "",
  endereco: "",
  site_url: "",
};

export default function ClientsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clients, loading, createClientAsync, updateClient, deleteClient, creating } = useClients();
  const [busca, setBusca] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientFormState>(emptyForm);

  const filtrados = useMemo(() => {
    const normalizedSearch = busca.trim().toLowerCase();

    return clients.filter((client) => {
      const matchBusca =
        client.nome.toLowerCase().includes(normalizedSearch) ||
        client.email.toLowerCase().includes(normalizedSearch) ||
        (client.nome_empresa && client.nome_empresa.toLowerCase().includes(normalizedSearch));
      return matchBusca;
    });
  }, [busca, clients]);

  const clientSignals = useMemo(
    () => [
      {
        label: "Ativos",
        value: `${clients.length}`,
        hint: "na base premium",
        accent: "text-[#C4B5FD]",
      },
      {
        label: "Empresas",
        value: `${clients.filter((client) => Boolean(client.nome_empresa?.trim())).length}`,
        hint: "com operacao",
        accent: "text-[#F9A8D4]",
      },
      {
        label: "Contato",
        value: `${clients.filter((client) => Boolean(client.whatsapp || client.telefone)).length}`,
        hint: "com telefone",
        accent: "text-[#86EFAC]",
      },
      {
        label: "Exibidos",
        value: `${filtrados.length}`,
        hint: "resultado atual",
        accent: "text-[#FCD34D]",
      },
    ],
    [clients, filtrados],
  );

  const resetForm = () => setForm(emptyForm);

  const handleSaveClient = async () => {
    const nome = form.nome.trim();
    const email = form.email.trim().toLowerCase();

    if (!nome || !email) {
      toast({
        title: "Campos obrigatorios",
        description: "Nome e e-mail sao obrigatorios.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingClient) {
        updateClient({
          id: editingClient.id,
          updates: { ...form }
        });
        setEditingClient(null);
      } else {
        const created = await createClientAsync({
          ...form,
          status: "ativo",
        });

        toast({
          title: "Cliente criado com sucesso",
          description: `${created.nome} ja esta disponivel na base de clientes.`,
        });
        navigate(`/admin/clientes/${created.id}`);
      }

      setCreateOpen(false);
      resetForm();
    } catch {
      void 0;
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setForm({
      nome: client.nome,
      nome_empresa: client.nome_empresa || "",
      email: client.email,
      whatsapp: client.whatsapp || "",
      telefone: client.telefone || "",
      documento: client.documento || "",
      cidade: client.cidade || "",
      estado: client.estado || "",
      endereco: client.endereco || "",
      site_url: client.site_url || "",
    });
    setCreateOpen(true);
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteClient(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <section className="admin-hero-card p-8 md:p-10">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-gradient opacity-60" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(192,38,211,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(220,38,38,0.08),transparent_28%)]" />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(124,58,237,0.22)] bg-[rgba(255,255,255,0.04)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--admin-muted)]">
              <Users className="h-3.5 w-3.5 text-[#EC4899]" />
              Client Command
            </div>
            <div>
              <h1 className="text-4xl font-light tracking-tight text-[var(--admin-text)] md:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                Base de <span className="text-brand-gradient italic">Clientes</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--admin-muted)]">
                Visao centralizada dos clientes ativos, com acesso rapido ao relacionamento, contato e operacao do ecossistema.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {clientSignals.map((signal) => (
                <div key={signal.label} className="admin-stat-pill">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-muted)]">{signal.label}</p>
                  <p className={`mt-2 text-2xl font-light tracking-tight ${signal.accent}`} style={{ fontFamily: "'Playfair Display', serif" }}>
                    {signal.value}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">{signal.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <Button
            className="h-12 rounded-2xl border-0 bg-brand-gradient px-8 text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-[0_14px_35px_rgba(124,58,237,0.24)] hover:scale-[1.02] transition-all"
            onClick={() => setCreateOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </section>

      <div className="admin-toolbar-card flex flex-col items-center justify-between gap-4 p-4 md:flex-row">
        <div className="group relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)] transition-colors group-focus-within:text-[#EC4899]" />
          <Input
            placeholder="Nome, e-mail ou empresa..."
            className="admin-input-shell pl-11"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>

        <Badge className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-300">
          Somente clientes ativos
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 px-1">
        <AnimatePresence mode="popLayout">
          {filtrados.map((client) => (
            <motion.div
              key={client.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card
                className="glass-card-admin group h-full cursor-pointer transition-all hover:scale-[1.02] hover:border-[#C026D3]/30"
                onClick={() => navigate(`/admin/clientes/${client.id}`)}
              >
                <CardContent className="p-8">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(255,255,255,0.05)] text-2xl font-black text-[var(--admin-text)] shadow-sm transition-all group-hover:bg-brand-gradient group-hover:text-white group-hover:border-transparent">
                      {client.avatar || client.nome[0]}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-3 py-1 text-[9px] font-black uppercase",
                          client.status === "ativo"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                            : client.status === "bloqueado"
                              ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
                              : "border-amber-500/20 bg-amber-500/10 text-amber-300",
                        )}
                      >
                        {client.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-[var(--admin-muted)] hover:text-[var(--admin-text)]">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="admin-dialog-panel w-48 rounded-2xl p-2">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(client); }} className="gap-2 focus:bg-brand-gradient focus:text-white cursor-pointer py-3 rounded-xl transition-all">
                            <Pencil size={14} className="text-[#7C3AED]" /> <span className="text-[10px] font-black uppercase tracking-wider">Editar Dados</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/admin/clientes/${client.id}`); }} className="gap-2 focus:bg-brand-gradient focus:text-white cursor-pointer py-3 rounded-xl transition-all">
                            <ExternalLink size={14} /> <span className="text-[10px] font-black uppercase tracking-wider">Perfil Completo</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(client.id); }} 
                            className="gap-2 focus:bg-rose-500 focus:text-white text-rose-500 cursor-pointer py-3 rounded-xl transition-all"
                          >
                            <Trash2 size={14} /> <span className="text-[10px] font-black uppercase tracking-wider">Remover</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="mb-6 space-y-1">
                    <h3 className="truncate text-xl font-black text-[var(--admin-text)] transition-colors group-hover:text-[#F9A8D4]">
                      {client.nome}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--admin-muted)]">
                      <Building size={14} className="text-white/30" />
                      {client.nome_empresa || "Startup / Sem Empresa"}
                    </div>
                  </div>

                  <div className="mb-8 space-y-3 border-t border-[rgba(124,58,237,0.14)] pt-6">
                    <div className="flex items-center gap-3 text-xs text-[var(--admin-muted)]">
                      <Mail size={14} className="text-white/30" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--admin-muted)]">
                      <Phone size={14} className="text-white/30" />
                      {client.whatsapp || client.telefone || "N/A"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">
                      Membro desde {new Date(client.created_at).getFullYear()}
                    </span>
                    <Button
                      variant="ghost"
                      className="h-9 px-4 text-xs font-black uppercase tracking-widest text-[#7C3AED] transition-all group-hover:translate-x-1 hover:bg-[#7C3AED]/5"
                    >
                      Ver Perfil <ArrowRight size={14} className="ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!loading && filtrados.length === 0 && (
        <Card className="glass-card-admin">
          <CardContent className="flex flex-col items-center justify-center gap-6 p-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-[rgba(124,58,237,0.16)] bg-[rgba(255,255,255,0.05)] shadow-sm">
              <Users className="h-8 w-8 text-[var(--admin-muted)]" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-[var(--admin-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                {clients.length === 0 ? "Nenhum cliente ativo" : "Nenhum resultado"}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-[var(--admin-muted)]">
                {clients.length === 0
                  ? "Esta tela mostra apenas clientes ativos. Comece criando seu primeiro cliente elite."
                  : "Tente ajustar os termos da busca para localizar o registro desejado."}
              </p>
            </div>
            <Button className="h-12 rounded-2xl border-0 bg-brand-gradient px-10 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_14px_35px_rgba(124,58,237,0.24)]" onClick={() => setCreateOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              {clients.length === 0 ? "Criar primeiro cliente" : "Criar novo cliente"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            resetForm();
            setEditingClient(null);
          }
        }}
      >
        <DialogContent className="admin-dialog-panel max-w-lg p-0">
          <DialogHeader className="p-10 pb-0">
            <DialogTitle className="text-3xl font-light tracking-tight text-[var(--admin-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {editingClient ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-10 py-8">
            <div className="grid gap-6 md:grid-cols-2 pb-6">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-muted)]">Nome Completo</Label>
                <Input
                  value={form.nome}
                  onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
                  className="admin-input-shell h-12"
                  placeholder="Ex: Joao Silva"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-muted)]">Empresa</Label>
                <Input
                  value={form.nome_empresa}
                  onChange={(event) => setForm((current) => ({ ...current, nome_empresa: event.target.value }))}
                  className="admin-input-shell h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-muted)]">CPF / CNPJ</Label>
                <Input
                  value={form.documento}
                  onChange={(event) => setForm((current) => ({ ...current, documento: event.target.value }))}
                  className="admin-input-shell h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-muted)]">E-mail</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="admin-input-shell h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-muted)]">WhatsApp</Label>
                <Input
                  value={form.whatsapp}
                  onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))}
                  className="admin-input-shell h-12"
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-3 border-t border-[rgba(124,58,237,0.14)] bg-[rgba(255,255,255,0.03)] p-10 pt-6">
            <Button
              variant="ghost"
              className="text-[var(--admin-muted)] hover:text-[var(--admin-text)] font-bold uppercase tracking-widest text-[10px]"
              onClick={() => {
                setCreateOpen(false);
                resetForm();
                setEditingClient(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="h-12 rounded-2xl border-0 bg-brand-gradient px-10 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_14px_35px_rgba(124,58,237,0.24)] hover:scale-105 transition-all"
              onClick={() => void handleSaveClient()}
              disabled={creating}
            >
              {creating ? "Salvando..." : (editingClient ? "Atualizar" : "Criar Cliente")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="admin-dialog-panel p-10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-light tracking-tight text-[var(--admin-text)]" style={{ fontFamily: "'Playfair Display', serif" }}>Remover Cliente?</AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-[var(--admin-muted)]">
              Esta acao nao pode ser desfeita. O cliente sera removido permanentemente do ecossistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-8">
            <AlertDialogCancel className="h-12 rounded-2xl border border-[rgba(124,58,237,0.18)] bg-[rgba(255,255,255,0.04)] px-8 text-[10px] font-bold uppercase tracking-widest text-[var(--admin-muted)] hover:bg-[rgba(255,255,255,0.08)]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-2xl bg-rose-500 text-white hover:bg-rose-600 font-bold uppercase tracking-widest text-[10px] h-12 px-8 shadow-lg shadow-rose-500/20"
            >
              Confirmar Exclusao
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
