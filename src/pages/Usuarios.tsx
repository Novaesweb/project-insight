import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Power } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const acessoLabel: Record<string, string> = { admin: "Admin", editor: "Editor", visualizador: "Visualizador" };

export default function Usuarios() {
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", cargo: "", acesso: "editor" });

  const fetch = async () => {
    const { data } = await supabase.from("usuarios").select("*").order("created_at", { ascending: false });
    setUsuarios(data || []);
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    const avatar = form.nome.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const { error } = await supabase.from("usuarios").insert({ ...form, avatar });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Usuário criado!" });
    setShowNew(false);
    setForm({ nome: "", email: "", cargo: "", acesso: "editor" });
    fetch();
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex justify-end" variants={fadeUp}>
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" /> Novo Usuário</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
            <DialogHeader><DialogTitle className="text-white">Novo Usuário</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              {[{ key: "nome", label: "Nome" }, { key: "email", label: "E-mail" }, { key: "cargo", label: "Cargo" }].map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">{f.label}</Label>
                  <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9"
                    value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Nível de Acesso</Label>
                <select className="w-full h-9 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent"
                  value={form.acesso} onChange={(e) => setForm({ ...form, acesso: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="visualizador">Visualizador</option>
                </select>
              </div>
            </div>
            <Button className="gradient-primary border-0 text-white w-full mt-4 rounded-lg" onClick={handleSave}>Salvar Usuário</Button>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  {["Usuário", "E-mail", "Cargo", "Acesso", "Status"].map((h) => (
                    <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum usuário</TableCell></TableRow>
                ) : usuarios.map((u) => (
                  <TableRow key={u.id} className="border-[rgba(255,255,255,0.04)]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                          <span className="text-white text-[10px] font-bold">{u.avatar || "?"}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{u.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{u.email}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{u.cargo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] gradient-text border-[rgba(232,51,74,0.3)]">
                        {acessoLabel[u.acesso] || u.acesso}
                      </Badge>
                    </TableCell>
                    <TableCell><StatusBadge status={u.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
