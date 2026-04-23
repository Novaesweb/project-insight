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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between px-2">
        <div>
          <h1 className="text-5xl font-light tracking-tight text-slate-900 md:text-6xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            Base de <span className="text-brand-gradient italic">Clientes</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-500 leading-relaxed">
            Gerenciamento centralizado de contas, acessos e faturamento.
          </p>
        </div>
        <Button
          className="bg-white text-slate-900 border border-[#FF1F1F]/10 h-12 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#7C3AED]/10 hover:scale-[1.02] transition-all"
          onClick={() => setCreateOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4 text-[#FF1F1F]" />
          Novo Cliente
        </Button>
      </div>

      <div className="glass-premium flex flex-col items-center justify-between gap-4 rounded-[32px] p-4 md:flex-row border-slate-200">
        <div className="group relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-[#EC4899]" />
          <Input
            placeholder="Nome, e-mail ou empresa..."
            className="h-11 rounded-2xl border-slate-100 bg-white/50 pl-11 text-slate-900 focus:ring-1 focus:ring-[#7C3AED]/20 shadow-sm"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>

        <Badge className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
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
                className="glass-premium group h-full cursor-pointer transition-all hover:scale-[1.02] border-slate-200 shadow-sm bg-white/80"
                onClick={() => navigate(`/admin/clientes/${client.id}`)}
              >
                <CardContent className="p-8">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-2xl font-black text-slate-900 shadow-sm transition-all group-hover:bg-brand-gradient group-hover:text-white group-hover:border-transparent">
                      {client.avatar || client.nome[0]}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-3 py-1 text-[9px] font-black uppercase",
                          client.status === "ativo"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                            : client.status === "bloqueado"
                              ? "border-rose-100 bg-rose-50 text-rose-500"
                              : "border-amber-100 bg-amber-50 text-amber-600",
                        )}
                      >
                        {client.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-slate-300 hover:text-slate-900">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl glass-premium p-2 border-slate-200">
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
                    <h3 className="truncate text-xl font-black text-slate-900 transition-colors group-hover:text-[#EC4899]">
                      {client.nome}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <Building size={14} className="text-slate-300" />
                      {client.nome_empresa || "Startup / Sem Empresa"}
                    </div>
                  </div>

                  <div className="mb-8 space-y-3 border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <Mail size={14} className="text-slate-300" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <Phone size={14} className="text-slate-300" />
                      {client.whatsapp || client.telefone || "N/A"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
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
        <Card className="glass-premium border-slate-200 bg-white/40">
          <CardContent className="flex flex-col items-center justify-center gap-6 p-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-slate-100 bg-white shadow-sm">
              <Users className="h-8 w-8 text-slate-300" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                {clients.length === 0 ? "Nenhum cliente ativo" : "Nenhum resultado"}
              </h2>
              <p className="max-w-xl text-sm text-slate-500 mt-2">
                {clients.length === 0
                  ? "Esta tela mostra apenas clientes ativos. Comece criando seu primeiro cliente elite."
                  : "Tente ajustar os termos da busca para localizar o registro desejado."}
              </p>
            </div>
            <Button className="bg-white text-slate-900 border border-[#FF1F1F]/10 px-10 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#7C3AED]/10" onClick={() => setCreateOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4 text-[#FF1F1F]" />
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
        <DialogContent className="max-w-lg rounded-[2.5rem] border-slate-200 bg-white p-0 text-slate-900 overflow-hidden shadow-2xl">
          <DialogHeader className="p-10 pb-0">
            <DialogTitle className="text-3xl font-light tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              {editingClient ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] px-10 py-8">
            <div className="grid gap-6 md:grid-cols-2 pb-6">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nome Completo</Label>
                <Input
                  value={form.nome}
                  onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
                  className="h-12 border-slate-200 bg-slate-50 text-slate-900 rounded-2xl focus:ring-primary/20 shadow-sm"
                  placeholder="Ex: Joao Silva"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Empresa</Label>
                <Input
                  value={form.nome_empresa}
                  onChange={(event) => setForm((current) => ({ ...current, nome_empresa: event.target.value }))}
                  className="h-12 border-slate-200 bg-slate-50 text-slate-900 rounded-2xl focus:ring-primary/20 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">CPF / CNPJ</Label>
                <Input
                  value={form.documento}
                  onChange={(event) => setForm((current) => ({ ...current, documento: event.target.value }))}
                  className="h-12 border-slate-200 bg-slate-50 text-slate-900 rounded-2xl focus:ring-primary/20 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">E-mail</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="h-12 border-slate-200 bg-slate-50 text-slate-900 rounded-2xl focus:ring-primary/20 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">WhatsApp</Label>
                <Input
                  value={form.whatsapp}
                  onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))}
                  className="h-12 border-slate-200 bg-slate-50 text-slate-900 rounded-2xl focus:ring-primary/20 shadow-sm"
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-3 p-10 pt-6 border-t border-slate-100 bg-slate-50/50">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px]"
              onClick={() => {
                setCreateOpen(false);
                resetForm();
                setEditingClient(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-white text-slate-900 border border-[#FF1F1F]/10 px-10 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#7C3AED]/10 hover:scale-105 transition-all"
              onClick={() => void handleSaveClient()}
              disabled={creating}
            >
              {creating ? "Salvando..." : (editingClient ? "Atualizar" : "Criar Cliente")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border-slate-200 bg-white text-slate-900 p-10 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-light tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Remover Cliente?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 mt-2">
              Esta acao nao pode ser desfeita. O cliente sera removido permanentemente do ecossistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-8">
            <AlertDialogCancel className="rounded-2xl border-slate-200 bg-white text-slate-500 hover:bg-slate-50 font-bold uppercase tracking-widest text-[10px] h-12 px-8">
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
