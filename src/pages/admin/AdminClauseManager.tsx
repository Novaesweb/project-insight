import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookText,
  Filter,
  GripVertical,
  Pencil,
  Plus,
  Printer,
  Save,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  CLAUSE_CATEGORIES,
  CLAUSE_VARIABLE_TOKENS,
  createClauseLibraryItem,
  createDefaultContractClauseSelection,
  createSelectionItemFromClause,
  getClauseCategoryMeta,
  loadClauseLibrary,
  mergeClauseSelectionWithLibrary,
  replaceClauseVariables,
  saveClauseLibrary,
  type ClauseCategory,
  type ClauseLibraryItem,
  type ContractClauseSelection,
} from "@/lib/contract-clauses";

const CLAUSE_MANAGER_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

.nw-clause-manager,
.nw-clause-manager * {
  box-sizing: border-box;
}

.nw-clause-manager {
  --cm-bg: #07000d;
  --cm-surface: #0d0018;
  --cm-surface-2: #150022;
  --cm-gradient: linear-gradient(135deg, #7c3aed, #c026d3, #dc2626);
  --cm-border: rgba(124,58,237,.22);
  --cm-text: #f0e8ff;
  --cm-muted: #9b89b8;
  --cm-faint: #3e2f58;
  color: var(--cm-text);
  font-family: 'Outfit', sans-serif;
}

.nw-clause-manager .cm-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.nw-clause-manager .cm-scroll::-webkit-scrollbar-thumb {
  background: #2a143f;
  border-radius: 999px;
}

.nw-clause-manager .cm-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.nw-clause-manager .cm-fade-up {
  animation: cmFadeUp .35s ease both;
}

@keyframes cmFadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

const INITIAL_VARIABLES = {
  "{{NOME_CLIENTE}}": "Joao Silva",
  "{{EMPRESA_CLIENTE}}": "Empresa Modelo Ltda.",
  "{{VALOR_ATIVACAO}}": "R$ 267,79",
  "{{MENSALIDADE}}": "R$ 65,00",
  "{{PRAZO_ENTREGA}}": "15 dias uteis",
  "{{DIA_VENCIMENTO}}": "dia 10",
  "{{DATA_INICIO}}": "01/08/2026",
  "{{DATA_TERMINO}}": "01/08/2027",
  "{{DURACAO}}": "12 meses",
  "{{NUM_REVISOES}}": "2 revisoes",
  "{{CONTRATADA}}": "NovaesWeb",
  "{{REPRESENTANTE}}": "Lucas Rodrigo Ferreira dos Santos",
} as Record<string, string>;

type ManagerTab = "montar" | "biblioteca" | "preview";

type EditorState = {
  open: boolean;
  clause: ClauseLibraryItem | null;
};

function Btn({
  children,
  variant = "ghost",
  onClick,
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  variant?: "ghost" | "grad";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-[14px] border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        borderColor: variant === "grad" ? "transparent" : "rgba(124,58,237,.22)",
        background: variant === "grad" ? "linear-gradient(135deg,#7C3AED,#C026D3,#DC2626)" : "rgba(255,255,255,.03)",
        color: "#f0e8ff",
      }}
    >
      {children}
    </button>
  );
}

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition"
      style={{
        borderColor: active ? "rgba(124,58,237,.35)" : "rgba(124,58,237,.18)",
        background: active ? "linear-gradient(135deg,rgba(124,58,237,.18),rgba(220,38,38,.08))" : "rgba(255,255,255,.02)",
        color: active ? "#f0e8ff" : "#9b89b8",
      }}
    >
      {children}
    </button>
  );
}

function CategoryBadge({ category }: { category: ClauseCategory }) {
  const meta = getClauseCategoryMeta(category);

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{
        backgroundColor: `${meta.color}26`,
        color: meta.color,
      }}
    >
      {meta.label}
    </span>
  );
}

function countByCategory(library: ClauseLibraryItem[]) {
  return CLAUSE_CATEGORIES.map((item) => ({
    ...item,
    total: library.filter((clause) => clause.category === item.id).length,
  }));
}

function renderSelectionPreview(selection: ContractClauseSelection, variables: Record<string, string>) {
  return selection.items
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((item, index) => ({
      ...item,
      order: index,
      previewText: replaceClauseVariables(item.text, variables),
    }));
}

function ClauseEditorModal({
  state,
  variables,
  onClose,
  onSave,
}: {
  state: EditorState;
  variables: Record<string, string>;
  onClose: () => void;
  onSave: (clause: ClauseLibraryItem) => void;
}) {
  const [draft, setDraft] = useState<ClauseLibraryItem | null>(state.clause);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setDraft(state.clause);
  }, [state.clause]);

  const previewText = useMemo(() => {
    if (!draft) return "";
    return replaceClauseVariables(draft.text, variables);
  }, [draft, variables]);

  const insertVariable = (token: string) => {
    if (!draft || !textareaRef.current) return;

    const element = textareaRef.current;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const nextText = `${draft.text.slice(0, start)}${token}${draft.text.slice(end)}`;

    setDraft({
      ...draft,
      text: nextText,
      updatedAt: new Date().toISOString(),
    });

    requestAnimationFrame(() => {
      element.focus();
      const cursor = start + token.length;
      element.setSelectionRange(cursor, cursor);
    });
  };

  if (!draft) return null;

  return (
    <Dialog open={state.open} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-w-5xl border-[rgba(124,58,237,.22)] bg-[#0d0018] text-[#f0e8ff]">
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            Editor de Clausula
          </DialogTitle>
          <DialogDescription className="text-[#9b89b8]">
            Ajuste titulo, categoria, obrigatoriedade e texto. O preview abaixo ja usa as variaveis atuais.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b89b8]">Titulo</span>
                <Input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      title: event.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="border-[rgba(124,58,237,.22)] bg-[#150022] text-[#f0e8ff] focus-visible:ring-0"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b89b8]">Categoria</span>
                <select
                  value={draft.category}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      category: event.target.value as ClauseCategory,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="h-10 rounded-[14px] border border-[rgba(124,58,237,.22)] bg-[#150022] px-3 text-sm text-[#f0e8ff] outline-none focus:border-[#7C3AED]"
                >
                  {CLAUSE_CATEGORIES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex items-center justify-between rounded-[16px] border border-[rgba(124,58,237,.22)] bg-[#150022] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[#f0e8ff]">Obrigatoria no contrato</p>
                <p className="text-xs text-[#9b89b8]">Itens obrigatorios ficam travados quando selecionados em um contrato.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    required: !draft.required,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="relative h-7 w-14 rounded-full transition"
                style={{ background: draft.required ? "linear-gradient(135deg,#7C3AED,#C026D3)" : "rgba(255,255,255,.12)" }}
              >
                <span
                  className="absolute top-1 h-5 w-5 rounded-full bg-white transition"
                  style={{ left: draft.required ? 34 : 4 }}
                />
              </button>
            </label>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {CLAUSE_VARIABLE_TOKENS.map((token) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() => insertVariable(token)}
                    className="rounded-full border border-[rgba(124,58,237,.22)] bg-[rgba(124,58,237,.08)] px-3 py-1 text-[11px] font-semibold text-[#f0e8ff]"
                  >
                    {token}
                  </button>
                ))}
              </div>
              <Textarea
                ref={textareaRef}
                value={draft.text}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    text: event.target.value,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="min-h-[220px] border-[rgba(124,58,237,.22)] bg-[#150022] text-[#f0e8ff] focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[22px] border border-[rgba(124,58,237,.22)] bg-[#150022] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b89b8]">Preview ao vivo</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#f0e8ff]">{previewText}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn
            variant="grad"
            onClick={() => {
              if (!draft.title.trim() || !draft.text.trim()) return;
              onSave(
                createClauseLibraryItem({
                  id: draft.id,
                  title: draft.title,
                  text: draft.text,
                  category: draft.category,
                  required: draft.required,
                  origin: draft.origin,
                }),
              );
            }}
          >
            <Save className="h-4 w-4" />
            Salvar clausula
          </Btn>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminClauseManager() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<ManagerTab>("montar");
  const [library, setLibrary] = useState<ClauseLibraryItem[]>([]);
  const [selection, setSelection] = useState<ContractClauseSelection>({ items: [], updatedAt: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ClauseCategory | "todas">("todas");
  const [variables, setVariables] = useState<Record<string, string>>(INITIAL_VARIABLES);
  const [editorState, setEditorState] = useState<EditorState>({ open: false, clause: null });
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  useEffect(() => {
    const nextLibrary = loadClauseLibrary();
    setLibrary(nextLibrary);
    setSelection(createDefaultContractClauseSelection(nextLibrary));
  }, []);

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

  const previewSelection = useMemo(() => renderSelectionPreview(selection, variables), [selection, variables]);
  const groupedStats = useMemo(() => countByCategory(library), [library]);

  const persistLibrary = (nextLibrary: ClauseLibraryItem[]) => {
    setLibrary(nextLibrary);
    saveClauseLibrary(nextLibrary);
  };

  const syncSelectionWithLibrary = (nextLibrary: ClauseLibraryItem[]) => {
    setSelection((current) => {
      if (current.items.length === 0 && !current.updatedAt) {
        return createDefaultContractClauseSelection(nextLibrary);
      }

      return mergeClauseSelectionWithLibrary(current, nextLibrary);
    });
  };

  const addToSelection = (clause: ClauseLibraryItem) => {
    setSelection((current) => {
      if (current.items.some((item) => item.clauseId === clause.id)) {
        return current;
      }

      return {
        items: [...current.items, createSelectionItemFromClause(clause, current.items.length)],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const removeFromSelection = (clauseId: string) => {
    setSelection((current) => {
      const target = current.items.find((item) => item.clauseId === clauseId);
      if (target?.required) {
        return current;
      }

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

    setSelection((current) => {
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

  const openNewClause = () => {
    setEditorState({
      open: true,
      clause: {
        id: `clause-${Date.now()}`,
        title: "",
        text: "",
        category: "geral",
        required: false,
        origin: "custom",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  };

  const handleSaveClause = (clause: ClauseLibraryItem) => {
    const exists = library.some((item) => item.id === clause.id);
    const nextLibrary = exists
      ? library.map((item) => (item.id === clause.id ? { ...clause, updatedAt: new Date().toISOString() } : item))
      : [...library, clause];

    persistLibrary(nextLibrary);
    syncSelectionWithLibrary(nextLibrary);
    setEditorState({ open: false, clause: null });
    toast({
      title: exists ? "Clausula atualizada" : "Clausula criada",
      description: "A biblioteca foi salva com sucesso.",
    });
  };

  const handleDeleteClause = (clause: ClauseLibraryItem) => {
    if (clause.origin === "seed" && clause.required) {
      toast({
        title: "Clausula protegida",
        description: "As clausulas obrigatorias da base nao podem ser excluidas daqui.",
        variant: "destructive",
      });
      return;
    }

    const nextLibrary = library.filter((item) => item.id !== clause.id);
    persistLibrary(nextLibrary);
    syncSelectionWithLibrary(nextLibrary);
    removeFromSelection(clause.id);
    toast({
      title: "Clausula removida",
      description: "A biblioteca foi atualizada.",
    });
  };

  return (
    <div className="nw-clause-manager min-h-screen bg-[#07000d] pb-10">
      <style>{CLAUSE_MANAGER_CSS}</style>

      <div className="mx-auto max-w-[1480px] px-4 py-4 md:px-6">
        <div
          className="sticky top-4 z-20 flex h-[58px] items-center gap-4 rounded-[20px] border px-5 shadow-[0_16px_40px_rgba(0,0,0,.35)]"
          style={{
            background: "#0d0018",
            borderColor: "rgba(124,58,237,.22)",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/admin/contratos")}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#9b89b8]"
            style={{ borderColor: "rgba(124,58,237,.18)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </button>

          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[12px] text-white"
              style={{ background: "linear-gradient(135deg,#7C3AED,#C026D3,#DC2626)" }}
            >
              <BookText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#9b89b8]">Biblioteca Global</p>
              <p className="text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                Gerenciador de Clausulas
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap gap-2">
            <Pill active={tab === "montar"} onClick={() => setTab("montar")}>
              Montar
            </Pill>
            <Pill active={tab === "biblioteca"} onClick={() => setTab("biblioteca")}>
              Biblioteca
            </Pill>
            <Pill active={tab === "preview"} onClick={() => setTab("preview")}>
              Preview
            </Pill>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside
            className="h-fit space-y-4 xl:sticky xl:top-[88px]"
            style={{ alignSelf: "start" }}
          >
            <div className="rounded-[28px] border p-5" style={{ background: "#0d0018", borderColor: "rgba(124,58,237,.22)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#9b89b8]">Resumo</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-[18px] border p-4" style={{ background: "#150022", borderColor: "rgba(124,58,237,.18)" }}>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#9b89b8]">Biblioteca</p>
                  <p className="mt-2 text-2xl font-semibold text-[#f0e8ff]">{library.length}</p>
                  <p className="text-sm text-[#9b89b8]">clausulas salvas</p>
                </div>
                <div className="rounded-[18px] border p-4" style={{ background: "#150022", borderColor: "rgba(124,58,237,.18)" }}>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#9b89b8]">Contrato atual</p>
                  <p className="mt-2 text-2xl font-semibold text-[#f0e8ff]">{selection.items.length}</p>
                  <p className="text-sm text-[#9b89b8]">selecionadas na montagem local</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border p-5" style={{ background: "#0d0018", borderColor: "rgba(124,58,237,.22)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#9b89b8]">Categorias</p>
              <div className="mt-4 space-y-2">
                {groupedStats.map((item, index) => (
                  <div
                    key={item.id}
                    className="cm-fade-up flex items-center justify-between rounded-[16px] border px-3 py-3"
                    style={{
                      background: "#150022",
                      borderColor: "rgba(124,58,237,.18)",
                      animationDelay: `${index * 35}ms`,
                    }}
                  >
                    <span className="text-sm text-[#f0e8ff]">{item.label}</span>
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: `${item.color}26`, color: item.color }}>
                      {item.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border p-5" style={{ background: "#0d0018", borderColor: "rgba(124,58,237,.22)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#9b89b8]">Acoes</p>
              <div className="mt-4 grid gap-2">
                <Btn variant="grad" onClick={openNewClause}>
                  <Plus className="h-4 w-4" />
                  Nova clausula
                </Btn>
                <Btn onClick={() => navigate("/admin/contratos")}>
                  <BookText className="h-4 w-4" />
                  Ir para contratos
                </Btn>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            {tab === "montar" ? (
              <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
                <section className="rounded-[30px] border p-5" style={{ background: "#0d0018", borderColor: "rgba(124,58,237,.22)" }}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#9b89b8]">Montar contrato</p>
                      <h2 className="mt-2 text-3xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Clausulas ativas
                      </h2>
                    </div>
                    <Btn variant="grad" onClick={() => setTab("preview")}>
                      <Printer className="h-4 w-4" />
                      Ver preview final
                    </Btn>
                  </div>

                  <div className="cm-scroll mt-5 max-h-[780px] space-y-3 overflow-auto pr-2">
                    {selection.items.map((item, index) => {
                      const categoryMeta = getClauseCategoryMeta(item.category);

                      return (
                        <div
                          key={`${item.clauseId}-${index}`}
                          draggable
                          onDragStart={() => onDragStart(index)}
                          onDragEnter={() => onDragEnter(index)}
                          onDragEnd={onDragEnd}
                          className="cm-fade-up rounded-[24px] border bg-[rgba(255,255,255,.03)] p-4"
                          style={{
                            borderColor: "rgba(124,58,237,.18)",
                            borderLeft: `4px solid ${categoryMeta.color}`,
                            animationDelay: `${index * 35}ms`,
                          }}
                        >
                          <div className="flex gap-3">
                            <div className="pt-1 text-[#9b89b8]">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <CategoryBadge category={item.category} />
                                {item.required ? (
                                  <span className="rounded-full bg-[rgba(16,185,129,.15)] px-2.5 py-1 text-[11px] font-semibold text-[#6ee7b7]">
                                    Obrigatoria
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-3 text-base font-semibold text-[#f0e8ff]">
                                {index + 1}. {item.title}
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#9b89b8]">{item.text}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromSelection(item.clauseId)}
                              disabled={item.required}
                              className="flex h-9 w-9 items-center justify-center rounded-full transition"
                              style={{ background: item.required ? "rgba(16,185,129,.15)" : "rgba(255,255,255,.04)" }}
                            >
                              {item.required ? <ShieldCheck className="h-4 w-4 text-[#6ee7b7]" /> : <Trash2 className="h-4 w-4 text-[#f0e8ff]" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {selection.items.length === 0 ? (
                      <div className="rounded-[24px] border border-dashed p-5 text-sm text-[#9b89b8]" style={{ borderColor: "rgba(124,58,237,.18)" }}>
                        Nenhuma clausula ativa nesta montagem. Adicione itens da biblioteca ao lado.
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="rounded-[30px] border p-5" style={{ background: "#0d0018", borderColor: "rgba(124,58,237,.22)" }}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#9b89b8]">Biblioteca</p>
                      <h2 className="mt-2 text-3xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Adicionar com 1 clique
                      </h2>
                    </div>
                    <Btn onClick={() => setTab("biblioteca")}>
                      <Filter className="h-4 w-4" />
                      Gerenciar biblioteca
                    </Btn>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b89b8]" />
                      <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Buscar por titulo ou texto"
                        className="border-[rgba(124,58,237,.22)] bg-[#150022] pl-10 text-[#f0e8ff] focus-visible:ring-0"
                      />
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value as ClauseCategory | "todas")}
                      className="h-10 rounded-[14px] border border-[rgba(124,58,237,.22)] bg-[#150022] px-3 text-sm text-[#f0e8ff] outline-none focus:border-[#7C3AED]"
                    >
                      <option value="todas">Todas</option>
                      {CLAUSE_CATEGORIES.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="cm-scroll mt-5 max-h-[700px] space-y-3 overflow-auto pr-2">
                    {filteredLibrary.map((item, index) => {
                      const isSelected = selection.items.some((selected) => selected.clauseId === item.id);

                      return (
                        <div
                          key={item.id}
                          className="cm-fade-up rounded-[22px] border p-4 transition"
                          style={{
                            background: "#150022",
                            borderColor: "rgba(124,58,237,.18)",
                            animationDelay: `${index * 35}ms`,
                          }}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <CategoryBadge category={item.category} />
                                {item.required ? (
                                  <span className="rounded-full bg-[rgba(16,185,129,.15)] px-2.5 py-1 text-[11px] font-semibold text-[#6ee7b7]">
                                    Obrigatoria
                                  </span>
                                ) : null}
                              </div>
                              <div>
                                <p className="text-base font-semibold text-[#f0e8ff]">{item.title}</p>
                                <p className="mt-2 line-clamp-4 text-sm leading-7 text-[#9b89b8]">{item.text}</p>
                              </div>
                            </div>
                            <Btn variant="grad" onClick={() => addToSelection(item)} disabled={isSelected}>
                              <Plus className="h-4 w-4" />
                              {isSelected ? "Adicionada" : "Adicionar"}
                            </Btn>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            ) : null}

            {tab === "biblioteca" ? (
              <section className="rounded-[30px] border p-5" style={{ background: "#0d0018", borderColor: "rgba(124,58,237,.22)" }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#9b89b8]">Biblioteca global</p>
                    <h2 className="mt-2 text-3xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Todas as clausulas salvas
                    </h2>
                  </div>
                  <Btn variant="grad" onClick={openNewClause}>
                    <Plus className="h-4 w-4" />
                    Criar clausula
                  </Btn>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b89b8]" />
                    <Input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Buscar na biblioteca"
                      className="border-[rgba(124,58,237,.22)] bg-[#150022] pl-10 text-[#f0e8ff] focus-visible:ring-0"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value as ClauseCategory | "todas")}
                    className="h-10 rounded-[14px] border border-[rgba(124,58,237,.22)] bg-[#150022] px-3 text-sm text-[#f0e8ff] outline-none focus:border-[#7C3AED]"
                  >
                    <option value="todas">Todas</option>
                    {CLAUSE_CATEGORIES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {filteredLibrary.map((item, index) => (
                    <div
                      key={item.id}
                      className="cm-fade-up rounded-[24px] border p-5 transition"
                      style={{
                        background: "#150022",
                        borderColor: "rgba(124,58,237,.18)",
                        animationDelay: `${index * 35}ms`,
                      }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <CategoryBadge category={item.category} />
                            {item.required ? (
                              <span className="rounded-full bg-[rgba(16,185,129,.15)] px-2.5 py-1 text-[11px] font-semibold text-[#6ee7b7]">
                                Obrigatoria
                              </span>
                            ) : null}
                            <span className="rounded-full bg-[rgba(255,255,255,.05)] px-2.5 py-1 text-[11px] font-semibold text-[#9b89b8]">
                              {item.origin === "seed" ? "Base" : "Custom"}
                            </span>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-[#f0e8ff]">{item.title}</p>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#9b89b8]">{item.text}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditorState({ open: true, clause: item })}
                            className="flex h-10 w-10 items-center justify-center rounded-full border"
                            style={{ borderColor: "rgba(124,58,237,.22)", background: "rgba(255,255,255,.03)" }}
                          >
                            <Pencil className="h-4 w-4 text-[#f0e8ff]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClause(item)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border"
                            style={{ borderColor: "rgba(124,58,237,.22)", background: "rgba(255,255,255,.03)" }}
                          >
                            <Trash2 className="h-4 w-4 text-[#f0e8ff]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {tab === "preview" ? (
              <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
                <section className="rounded-[30px] border p-5" style={{ background: "#0d0018", borderColor: "rgba(124,58,237,.22)" }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#9b89b8]">Variaveis</p>
                      <h2 className="mt-2 text-3xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Preview ao vivo
                      </h2>
                    </div>
                    <Btn variant="grad" onClick={() => window.print()}>
                      <Printer className="h-4 w-4" />
                      Imprimir
                    </Btn>
                  </div>

                  <div className="cm-scroll mt-5 max-h-[760px] space-y-3 overflow-auto pr-2">
                    {CLAUSE_VARIABLE_TOKENS.map((token) => (
                      <label key={token} className="block space-y-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b89b8]">{token}</span>
                        <Input
                          value={variables[token]}
                          onChange={(event) =>
                            setVariables((current) => ({
                              ...current,
                              [token]: event.target.value,
                            }))
                          }
                          className="border-[rgba(124,58,237,.22)] bg-[#150022] text-[#f0e8ff] focus-visible:ring-0"
                        />
                      </label>
                    ))}
                  </div>
                </section>

                <section className="rounded-[30px] border p-0" style={{ background: "#0d0018", borderColor: "rgba(124,58,237,.22)" }}>
                  <div
                    className="rounded-t-[30px] px-8 py-7 text-white"
                    style={{ background: "linear-gradient(135deg,#7C3AED,#C026D3,#DC2626)" }}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/80">Contrato dinamic</p>
                    <h2 className="mt-2 text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Biblioteca de clausulas aplicada
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm text-white/85">
                      Veja abaixo como as clausulas ficam renderizadas com numeracao automatica, borda por categoria e substituicao de variaveis em tempo real.
                    </p>
                  </div>

                  <div className="space-y-4 p-6">
                    {previewSelection.map((item, index) => {
                      const meta = getClauseCategoryMeta(item.category);

                      return (
                        <div
                          key={`${item.clauseId}-${index}`}
                          className="cm-fade-up rounded-[24px] border p-5"
                          style={{
                            background: "#150022",
                            borderColor: "rgba(124,58,237,.18)",
                            borderLeft: `5px solid ${meta.color}`,
                            animationDelay: `${index * 45}ms`,
                          }}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <CategoryBadge category={item.category} />
                            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b89b8]">
                              Clausula {index + 1}
                            </span>
                          </div>
                          <h3 className="mt-4 text-2xl text-[#f0e8ff]" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {item.title}
                          </h3>
                          <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-[#f0e8ff]">{item.previewText}</p>
                        </div>
                      );
                    })}

                    {previewSelection.length === 0 ? (
                      <div className="rounded-[24px] border border-dashed p-6 text-sm text-[#9b89b8]" style={{ borderColor: "rgba(124,58,237,.18)" }}>
                        Nenhuma clausula foi selecionada para o preview.
                      </div>
                    ) : null}
                  </div>
                </section>
              </div>
            ) : null}
          </main>
        </div>
      </div>

      <ClauseEditorModal
        state={editorState}
        variables={variables}
        onClose={() => setEditorState({ open: false, clause: null })}
        onSave={handleSaveClause}
      />
    </div>
  );
}
