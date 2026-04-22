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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">Base de Clientes</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/55">
            Gerenciamento centralizado de contas, acessos e faturamento.
          </p>
        </div>
        <Button
          className="gradient-primary h-12 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20"
          onClick={() => setCreateOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="glass-card-premium flex flex-col items-center justify-between gap-4 rounded-3xl p-4 md:flex-row">
        <div className="group relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Nome, e-mail ou empresa..."
            className="h-11 rounded-2xl border-white/5 bg-white/5 pl-11 text-white focus:ring-1 focus:ring-primary/20"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>

        <Badge className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-300">
          Somente clientes ativos
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                className="glass-card-premium group h-full cursor-pointer transition-all hover:scale-[1.02]"
                onClick={() => navigate(`/admin/clientes/${client.id}`)}
              >
                <CardContent className="p-8">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-2xl font-black text-primary shadow-xl shadow-primary/5 transition-all group-hover:bg-primary/20">
                      {client.avatar || client.nome[0]}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-3 py-1 text-[9px] font-black uppercase",
                          client.status === "ativo"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : client.status === "bloqueado"
                              ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-300",
                        )}
                      >
                        {client.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-white/20 hover:text-white">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-white/10 bg-[#1a1421] text-white">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(client); }} className="gap-2 focus:bg-white/5 focus:text-white cursor-pointer">
                            <Pencil size={14} className="text-primary" /> Editar Dados
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/admin/clientes/${client.id}`); }} className="gap-2 focus:bg-white/5 focus:text-white cursor-pointer">
                            <ExternalLink size={14} /> Ver Perfil Completo
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(client.id); }} 
                            className="gap-2 focus:bg-rose-500/10 focus:text-rose-400 text-rose-400/80 cursor-pointer"
                          >
                            <Trash2 size={14} /> Remover Cliente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="mb-6 space-y-1">
                    <h3 className="truncate text-xl font-black text-white transition-colors group-hover:text-primary">
                      {client.nome}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-white/40">
                      <Building size={14} />
                      {client.nome_empresa || "Startup / Sem Empresa"}
                    </div>
                  </div>

                  <div className="mb-8 space-y-3 border-t border-white/5 pt-6">
                    <div className="flex items-center gap-3 text-xs text-white/60">
                      <Mail size={14} className="text-white/20" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/60">
                      <Phone size={14} className="text-white/20" />
                      {client.whatsapp || client.telefone || "N/A"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                      Membro desde {new Date(client.created_at).getFullYear()}
                    </span>
                    <Button
                      variant="ghost"
                      className="h-9 px-4 text-xs font-black uppercase tracking-widest text-primary transition-all group-hover:translate-x-1"
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
        <Card className="glass-card-premium border-white/10">
          <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Users className="h-7 w-7 text-white/35" />
            </div>
            <h2 className="text-xl font-black text-white">
              {clients.length === 0 ? "Nenhum cliente ativo encontrado" : "Nenhum cliente encontrado nessa busca"}
            </h2>
            <p className="max-w-xl text-sm text-white/50">
              {clients.length === 0
                ? "Esta tela mostra apenas clientes com status ativo. Clientes removidos, inativos ou bloqueados nao aparecem aqui."
                : "Tente ajustar o nome, e-mail ou empresa para localizar um cliente ativo na base."}
            </p>
            <Button className="gradient-primary border-0 text-white" onClick={() => setCreateOpen(true)}>
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
        <DialogContent className="max-w-lg rounded-[2rem] border-white/10 bg-[#120d18] p-0 text-white overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-2xl font-black">
              {editingClient ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-8 py-6">
            <div className="grid gap-4 md:grid-cols-2 pb-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs uppercase tracking-widest text-white/40">Nome Completo</Label>
                <Input
                  value={form.nome}
                  onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
                  className="h-12 border-white/10 bg-black/30 text-white rounded-xl"
                  placeholder="Ex: Joao Silva"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-white/40">Empresa / Negocio</Label>
                <Input
                  value={form.nome_empresa}
                  onChange={(event) => setForm((current) => ({ ...current, nome_empresa: event.target.value }))}
                  className="h-12 border-white/10 bg-black/30 text-white rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-white/40">CPF / CNPJ</Label>
                <Input
                  value={form.documento}
                  onChange={(event) => setForm((current) => ({ ...current, documento: event.target.value }))}
                  className="h-12 border-white/10 bg-black/30 text-white rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-white/40">E-mail</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="h-12 border-white/10 bg-black/30 text-white rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-white/40">WhatsApp</Label>
                <Input
                  value={form.whatsapp}
                  onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))}
                  className="h-12 border-white/10 bg-black/30 text-white rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-white/40">Telefone</Label>
                <Input
                  value={form.telefone}
                  onChange={(event) => setForm((current) => ({ ...current, telefone: event.target.value }))}
                  className="h-12 border-white/10 bg-black/30 text-white rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-white/40">Site URL</Label>
                <Input
                  value={form.site_url}
                  onChange={(event) => setForm((current) => ({ ...current, site_url: event.target.value }))}
                  className="h-12 border-white/10 bg-black/30 text-white rounded-xl"
                  placeholder="https://"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-white/40">Cidade</Label>
                <Input
                  value={form.cidade}
                  onChange={(event) => setForm((current) => ({ ...current, cidade: event.target.value }))}
                  className="h-12 border-white/10 bg-black/30 text-white rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-white/40">Estado</Label>
                <Input
                  value={form.estado}
                  onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value }))}
                  className="h-12 border-white/10 bg-black/30 text-white rounded-xl"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs uppercase tracking-widest text-white/40">Endereco</Label>
                <Input
                  value={form.endereco}
                  onChange={(event) => setForm((current) => ({ ...current, endereco: event.target.value }))}
                  className="h-12 border-white/10 bg-black/30 text-white rounded-xl"
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-3 p-8 pt-4 border-t border-white/5 bg-black/20">
            <Button
              variant="ghost"
              className="text-white/60 hover:text-white"
              onClick={() => {
                setCreateOpen(false);
                resetForm();
                setEditingClient(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="gradient-primary border-0 text-white px-8 rounded-xl font-black uppercase tracking-widest text-[10px]"
              onClick={() => void handleSaveClient()}
              disabled={creating}
            >
              {creating ? "Salvando..." : (editingClient ? "Atualizar Dados" : "Criar Cliente")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="rounded-3xl border-white/10 bg-[#120d18] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black">Remover Cliente?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              Esta acao nao pode ser desfeita. O cliente sera removido permanentemente da base de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-xl bg-rose-500 text-white hover:bg-rose-600 font-bold"
            >
              Confirmar Exclusao
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
