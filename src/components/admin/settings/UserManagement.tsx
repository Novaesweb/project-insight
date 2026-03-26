import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newPass, setNewPass] = useState("");
  const { toast } = useToast();

  const loadAll = async () => {
    setLoading(true);
    const [u, c] = await Promise.all([
      supabase.from("usuarios").select("*").order("nome"),
      supabase.from("clientes").select("*").order("nome")
    ]);
    setUsers(u.data || []);
    setClients(c.data || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleUpdate = async (type: 'usuarios' | 'clientes', id: string, data: any) => {
    // Remove temporary _type for database update
    const { _type, ...updateData } = data;
    const { error } = await supabase.from(type).update(updateData).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Atualizado com sucesso!" });
      setEditingItem(null);
      setNewPass("");
      loadAll();
    }
  };

  if (loading) return <div className="py-10 text-center text-white/40 text-xs">Carregando ecossistemas de usuários...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 px-1 flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-primary" /> Administradores e Equipe
        </h3>
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 bg-white/[0.01]">
              <TableHead className="text-[10px] uppercase">Nome</TableHead>
              <TableHead className="text-[10px] uppercase">E-mail</TableHead>
              <TableHead className="text-[10px] uppercase">Cargo</TableHead>
              <TableHead className="text-[10px] uppercase text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="text-sm text-white font-medium">{u.nome}</TableCell>
                <TableCell className="text-sm text-white/50">{u.email}</TableCell>
                <TableCell><Badge variant="outline" className="text-[9px] uppercase border-primary/20 text-primary">{u.cargo}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-xs text-white/40 hover:text-white" onClick={() => setEditingItem({ ...u, _type: 'usuarios' })}>Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 px-1 flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-accent" /> Clientes (Portal WebNovaX)
        </h3>
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 bg-white/[0.01]">
              <TableHead className="text-[10px] uppercase">Cliente</TableHead>
              <TableHead className="text-[10px] uppercase">E-mail</TableHead>
              <TableHead className="text-[10px] uppercase">Senha</TableHead>
              <TableHead className="text-[10px] uppercase text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map(c => (
              <TableRow key={c.id} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="text-sm text-white font-medium">{c.nome}</TableCell>
                <TableCell className="text-sm text-white/50">{c.email}</TableCell>
                <TableCell className="text-xs font-mono text-white/30">{c.senha || "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-xs text-white/40 hover:text-white" onClick={() => setEditingItem({ ...c, _type: 'clientes' })}>Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card border-white/10 w-full max-w-md p-8 shadow-2xl relative">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tighter">Editar Perfil Architect</h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs text-white/30 uppercase tracking-widest">Nome Completo</Label>
                <Input value={editingItem.nome} onChange={e => setEditingItem({ ...editingItem, nome: e.target.value })} className="glass-input h-10 text-sm text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-white/30 uppercase tracking-widest">E-mail de Acesso</Label>
                <Input value={editingItem.email} onChange={e => setEditingItem({ ...editingItem, email: e.target.value })} className="glass-input h-10 text-sm text-white" />
              </div>
              {editingItem._type === 'clientes' && (
                <div className="space-y-2">
                  <Label className="text-xs text-white/30 uppercase tracking-widest">URL do Ativo Digital</Label>
                  <Input value={editingItem.site_url || ""} onChange={e => setEditingItem({ ...editingItem, site_url: e.target.value })} placeholder="https://..." className="glass-input h-10 text-sm text-white" />
                </div>
              )}
              <div className="space-y-2 pt-4 border-t border-white/5">
                <Label className="text-xs text-primary/60 uppercase tracking-widest font-black">Redefinição de Senha</Label>
                <div className="flex gap-2">
                  <Input value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Nova senha master..." className="glass-input h-10 text-sm text-white" />
                  <Button size="sm" className="gradient-primary h-10 px-6 font-bold" onClick={() => handleUpdate(editingItem._type, editingItem.id, { ...editingItem, senha: newPass || editingItem.senha })}>Gravar</Button>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <Button variant="ghost" className="text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest" onClick={() => setEditingItem(null)}>Cancelar</Button>
              <Button className="bg-white/5 border border-white/10 text-white uppercase text-[10px] font-black tracking-widest hover:bg-white/10" onClick={() => handleUpdate(editingItem._type, editingItem.id, editingItem)}>Salvar Alterações</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}


