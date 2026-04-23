import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookText,
  ExternalLink,
  GripVertical,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  buildClauseVariableMap,
  createDefaultContractClauseSelection,
  createSelectionItemFromClause,
  getClauseCategoryMeta,
  loadClauseLibrary,
  mergeClauseSelectionWithLibrary,
  renderContractClauseSelection,
  type ClauseCategory,
  type ClauseLibraryItem,
  type ContractClauseSelection,
} from "@/lib/contract-clauses";
import type { ContractBuilderPayload } from "@/lib/contract-builder";

type ContractClausePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: ContractBuilderPayload;
  selection: ContractClauseSelection;
  onApply: (selection: ContractClauseSelection) => void;
};

function buildInitialSelection(
  selection: ContractClauseSelection,
  library: ClauseLibraryItem[],
) {
  if (selection.items.length > 0 || selection.updatedAt) {
    return mergeClauseSelectionWithLibrary(selection, library);
  }

  return createDefaultContractClauseSelection(library);
}

export function ContractClausePickerDialog({
  open,
  onOpenChange,
  payload,
  selection,
  onApply,
}: ContractClausePickerDialogProps) {
  const [library, setLibrary] = useState<ClauseLibraryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ClauseCategory | "todas">("todas");
  const [workingSelection, setWorkingSelection] = useState<ContractClauseSelection>(selection);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;

    const nextLibrary = loadClauseLibrary();
    setLibrary(nextLibrary);
    setWorkingSelection(buildInitialSelection(selection, nextLibrary));
  }, [open, selection]);

  const filteredLibrary = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return library.filter((item) => {
      const matchesCategory = categoryFilter === "todas" || item.category === categoryFilter;
      const matchesSearch =
        !normalizedSearch ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.text.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, library, searchTerm]);

  const variableMap = useMemo(() => buildClauseVariableMap(payload), [payload]);
  const previewText = useMemo(
    () => renderContractClauseSelection(workingSelection, variableMap),
    [variableMap, workingSelection],
  );

  const selectedIds = useMemo(
    () => new Set(workingSelection.items.map((item) => item.clauseId)),
    [workingSelection.items],
  );

  const addClause = (item: ClauseLibraryItem) => {
    setWorkingSelection((current) => {
      if (current.items.some((selected) => selected.clauseId === item.id)) {
        return current;
      }

      return {
        items: [...current.items, createSelectionItemFromClause(item, current.items.length)],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const removeClause = (clauseId: string) => {
    setWorkingSelection((current) => {
      const target = current.items.find((item) => item.clauseId === clauseId);
      if (target?.required) return current;

      return {
        items: current.items
          .filter((item) => item.clauseId !== clauseId)
          .map((item, index) => ({
            ...item,
            order: index,
          })),
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const onDragStart = (index: number) => {
    dragItem.current = index;
  };

  const onDragEnter = (index: number) => {
    dragOver.current = index;
  };

  const onDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return;

    setWorkingSelection((current) => {
      const nextItems = [...current.items];
      const [moved] = nextItems.splice(dragItem.current as number, 1);
      nextItems.splice(dragOver.current as number, 0, moved);

      return {
        items: nextItems.map((item, index) => ({
          ...item,
          order: index,
        })),
        updatedAt: new Date().toISOString(),
      };
    });

    dragItem.current = null;
    dragOver.current = null;
  };

  const handleApply = () => {
    onApply({
      items: workingSelection.items.map((item, index) => ({
        ...item,
        order: index,
      })),
      updatedAt: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-6xl overflow-hidden border-white/10 bg-[#0f0816] p-0 text-white">
        <div className="grid h-full max-h-[92vh] lg:grid-cols-[1.1fr_1.2fr]">
          <div className="border-r border-white/10 bg-[#120b19]">
            <DialogHeader className="border-b border-white/10 px-6 py-5">
              <DialogTitle className="text-2xl text-white">Selecionar clausulas salvas</DialogTitle>
              <DialogDescription className="text-white/55">
                Escolha quais clausulas da biblioteca entram neste contrato. As obrigatorias ficam travadas quando selecionadas.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 px-6 py-5">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar titulo ou texto"
                    className="border-white/10 bg-black/30 pl-10 text-white"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value as ClauseCategory | "todas")}
                  className="h-10 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none focus:border-fuchsia-300/30"
                >
                  <option value="todas">Todas as categorias</option>
                  <option value="objeto">Objeto</option>
                  <option value="pagamento">Pagamento</option>
                  <option value="cancelamento">Cancelamento</option>
                  <option value="entrega">Entrega</option>
                  <option value="revisao">Revisoes</option>
                  <option value="propriedade">Propriedade</option>
                  <option value="sigilo">Sigilo</option>
                  <option value="suporte">Suporte</option>
                  <option value="geral">Geral</option>
                </select>
              </div>

              <ScrollArea className="h-[52vh] pr-3">
                <div className="space-y-3">
                  {filteredLibrary.map((item) => {
                    const categoryMeta = getClauseCategoryMeta(item.category);
                    const isSelected = selectedIds.has(item.id);

                    return (
                      <div
                        key={item.id}
                        className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 transition hover:border-fuchsia-300/20"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className="border-0 text-white"
                                style={{
                                  backgroundColor: `${categoryMeta.color}26`,
                                  color: categoryMeta.color,
                                }}
                              >
                                {categoryMeta.label}
                              </Badge>
                              {item.required ? (
                                <Badge variant="outline" className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                                  Obrigatoria
                                </Badge>
                              ) : null}
                            </div>
                            <div>
                              <p className="text-base font-semibold text-white">{item.title}</p>
                              <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-white/60">{item.text}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            className="border-0 text-white"
                            style={{ background: "linear-gradient(135deg,#7C3AED,#C026D3,#DC2626)" }}
                            onClick={() => addClause(item)}
                            disabled={isSelected}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {isSelected ? "Ja adicionada" : "Adicionar"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredLibrary.length === 0 ? (
                    <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-white/55">
                      Nenhuma clausula encontrada nesse filtro. Se precisar editar a biblioteca completa, abra o gerenciador.
                    </div>
                  ) : null}
                </div>
              </ScrollArea>

              <div className="rounded-[20px] border border-white/10 bg-black/25 p-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => window.location.assign("/admin/clausulas")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir gerenciador completo
                </Button>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Clausulas aplicadas ao contrato</p>
                  <p className="mt-1 text-sm text-white/55">
                    Ordene por arrastar. Itens obrigatorios nao podem ser removidos depois de selecionados.
                  </p>
                </div>
                <Badge variant="outline" className="border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100">
                  {workingSelection.items.length} selecionada(s)
                </Badge>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 xl:grid-cols-[0.95fr_1.05fr]">
              <ScrollArea className="h-[60vh] border-b border-white/10 xl:h-full xl:border-b-0 xl:border-r xl:border-white/10">
                <div className="space-y-3 p-5">
                  {workingSelection.items.map((item, index) => {
                    const categoryMeta = getClauseCategoryMeta(item.category);

                    return (
                      <div
                        key={`${item.clauseId}-${index}`}
                        draggable
                        onDragStart={() => onDragStart(index)}
                        onDragEnter={() => onDragEnter(index)}
                        onDragEnd={onDragEnd}
                        className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 transition hover:border-fuchsia-300/20"
                        style={{ borderLeft: `4px solid ${categoryMeta.color}` }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 text-white/35">
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className="border-0 text-white"
                                style={{
                                  backgroundColor: `${categoryMeta.color}26`,
                                  color: categoryMeta.color,
                                }}
                              >
                                {categoryMeta.label}
                              </Badge>
                              {item.required ? (
                                <Badge variant="outline" className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                                  Travada
                                </Badge>
                              ) : null}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {index + 1}. {item.title}
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/60">
                                {item.text}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-white/55 hover:bg-white/10 hover:text-white"
                            onClick={() => removeClause(item.clauseId)}
                            disabled={item.required}
                          >
                            {item.required ? <ShieldCheck className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {workingSelection.items.length === 0 ? (
                    <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-white/55">
                      Nenhuma clausula aplicada ainda. Adicione itens da biblioteca para preencher o bloco do contrato.
                    </div>
                  ) : null}
                </div>
              </ScrollArea>

              <div className="flex min-h-0 flex-col">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <BookText className="h-4 w-4 text-fuchsia-300" />
                    <p className="text-sm font-semibold text-white">Preview do bloco gerado</p>
                  </div>
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-white/65">
                    Variaveis ao vivo
                  </Badge>
                </div>
                <div className="min-h-0 flex-1 p-5">
                  <Textarea
                    readOnly
                    value={previewText}
                    className="h-[46vh] min-h-[46vh] resize-none border-white/10 bg-black/30 font-mono text-xs text-white/80"
                  />
                  <Separator className="my-4 bg-white/10" />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(variableMap).map(([token, value]) => (
                      <div key={token} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{token}</p>
                        <p className="mt-1 text-sm text-white/75">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-white/10 px-6 py-4">
              <Button
                type="button"
                variant="ghost"
                className="text-white/60 hover:bg-white/5 hover:text-white"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                onClick={() =>
                  setWorkingSelection(
                    selection.items.length > 0 || selection.updatedAt
                      ? mergeClauseSelectionWithLibrary(selection, library)
                      : createDefaultContractClauseSelection(library),
                  )
                }
              >
                Restaurar
              </Button>
              <Button
                type="button"
                className="border-0 text-white"
                style={{ background: "linear-gradient(135deg,#7C3AED,#C026D3,#DC2626)" }}
                onClick={handleApply}
              >
                Aplicar ao contrato
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
