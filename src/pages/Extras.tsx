import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { extras } from "@/lib/mock-data";

export default function Extras() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Extras</h1>
          <p className="text-muted-foreground mt-1">Serviços e cobranças adicionais</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> Novo Extra</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Aprovação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extras.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.descricao}</TableCell>
                  <TableCell>{e.projeto}</TableCell>
                  <TableCell>R$ {e.valor.toLocaleString("pt-BR")}</TableCell>
                  <TableCell>{new Date(e.data).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={e.aprovado ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/20" : "bg-amber-500/15 text-amber-700 border-amber-500/20"}>
                      {e.aprovado ? "Aprovado" : "Pendente"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
