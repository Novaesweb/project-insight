import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { extras } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Extras() {
  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex justify-end" variants={fadeUp}>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" /> Novo Extra</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
            <DialogHeader><DialogTitle className="text-white">Novo Extra</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              {["Descrição", "Projeto", "Valor"].map((f) => (
                <div key={f} className="space-y-1.5">
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">{f}</Label>
                  <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" />
                </div>
              ))}
            </div>
            <Button className="gradient-primary border-0 text-white w-full mt-4 rounded-lg">Salvar Extra</Button>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  {["Descrição", "Projeto", "Valor", "Data", "Status"].map((h) => (
                    <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {extras.map((e) => (
                  <TableRow key={e.id} className="border-[rgba(255,255,255,0.04)]">
                    <TableCell className="text-sm font-medium text-white">{e.descricao}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{e.projeto}</TableCell>
                    <TableCell className="text-sm text-white">R$ {e.valor.toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{new Date(e.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell><StatusBadge status={e.status} /></TableCell>
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
