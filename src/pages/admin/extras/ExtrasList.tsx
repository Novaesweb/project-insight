import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useExtras } from "@/features/extras/hooks/useExtras";
import { DeleteConfirmDialog, useDeleteConfirm } from "@/components/DeleteConfirmDialog";
import { ExtraCard } from "@/features/extras/components/ExtraCard";
import { ExtraFilterBar } from "@/features/extras/components/ExtraFilterBar";

export default function ExtrasList() {
  const { catalog, packages, loading, updateExtra } = useExtras();
  const [filtro, setFiltro] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const { requestDelete, dialogProps } = useDeleteConfirm();

  const filtrados = useMemo(() => {
    let list = filtro === "pacotes" ? packages : catalog;
    if (filtro !== "todos" && filtro !== "pacotes") {
      list = (list as any[]).filter(e => e.categoria === filtro);
    }
    return (list as any[]).filter(e => 
      e.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (e.descricao?.toLowerCase() || "").includes(busca.toLowerCase())
    );
  }, [catalog, packages, filtro, busca]);

  return (
    <div className="space-y-8 pb-20">
      <ExtraFilterBar 
        busca={busca} 
        setBusca={setBusca} 
        filtro={filtro} 
        setFiltro={setFiltro} 
      />

      {/* Grid de Cards Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtrados.map((item) => (
            <ExtraCard
              key={item.id}
              item={item}
              isPkg={filtro === "pacotes"}
              onUpdate={(id, data) => updateExtra({ id, extra: data })}
              onDelete={(id) => requestDelete(async () => {
                // Implement delete logic if needed
              }, "Excluir Item", "Deseja remover este item do catálogo permanentemente?")}
              onAssign={(i) => console.log("Assign", i)}
              onEdit={(i) => console.log("Edit", i)}
            />
          ))}
        </AnimatePresence>
      </div>

      <DeleteConfirmDialog {...dialogProps} />
    </div>
  );
}
