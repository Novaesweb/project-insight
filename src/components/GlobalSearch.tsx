import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Users,
  FolderKanban,
  ShoppingCart,
  Headphones,
  DollarSign,
  Search,
  Star,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { adminRoutes, getFavoriteAdminRoutes, getRecentAdminRoutes } from "@/lib/admin-navigation";

type SearchResults = {
  clientes: Array<{ id: string; nome: string; email?: string | null }>;
  projetos: Array<{ id: string; titulo: string }>;
  leads: Array<{ id: string; nome: string; email?: string | null; whatsapp?: string | null; status?: string | null }>;
  pedidos: Array<{ id: string; codigo: string; tipo?: string | null }>;
  financeiro: Array<{ id: string; descricao: string; valor?: number | null; status?: string | null }>;
};

const emptyResults: SearchResults = {
  clientes: [],
  projetos: [],
  leads: [],
  pedidos: [],
  financeiro: [],
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const navigate = useNavigate();
  const { canAccessPath } = useAdminAccess();

  const favoriteRoutes = useMemo(() => getFavoriteAdminRoutes().filter((route) => canAccessPath(route.href)), [canAccessPath, open]);
  const recentRoutes = useMemo(() => getRecentAdminRoutes().filter((route) => canAccessPath(route.href)), [canAccessPath, open]);

  const routeMatches = useMemo(() => {
    if (!search.trim()) return [];

    const query = search.trim().toLowerCase();
    return adminRoutes.filter((route) => {
      const haystack = [route.label, route.shortLabel, ...(route.keywords || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query) && canAccessPath(route.href);
    }).slice(0, 5);
  }, [canAccessPath, search]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((current) => !current);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setResults(emptyResults);
      return;
    }

    const timer = setTimeout(async () => {
      const [clientes, projetos, leads, pedidos, financeiro] = await Promise.all([
        supabase.from("clientes").select("id, nome, email").or(`nome.ilike.%${search}%,email.ilike.%${search}%`).limit(5),
        supabase.from("projetos").select("id, titulo").ilike("titulo", `%${search}%`).limit(5),
        supabase.from("leads").select("id, nome, email, whatsapp, status").or(`nome.ilike.%${search}%,email.ilike.%${search}%,whatsapp.ilike.%${search}%`).limit(5),
        supabase.from("pedidos").select("id, codigo, tipo").or(`codigo.ilike.%${search}%,tipo.ilike.%${search}%`).limit(5),
        supabase.from("financeiro").select("id, descricao, valor, status").ilike("descricao", `%${search}%`).limit(5),
      ]);

      setResults({
        clientes: clientes.data || [],
        projetos: projetos.data || [],
        leads: leads.data || [],
        pedidos: pedidos.data || [],
        financeiro: financeiro.data || [],
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  const hasEntityResults = Object.values(results).some((items) => items.length > 0);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <button
        type="button"
        className="relative inline-flex h-9 w-full items-center justify-start rounded-[0.8rem] border border-white/10 bg-white/5 px-3 text-sm text-white/50 shadow-none transition-colors hover:text-white sm:pr-12 md:w-44 lg:w-72"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Buscar cliente, lead, fatura...</span>
        <span className="inline-flex lg:hidden">Busca global</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Busque por cliente, lead, pedido, fatura ou rota do admin"
          value={search}
          onValueChange={setSearch}
          className="text-white"
        />

        <CommandList className="text-white">
          {search.trim().length > 1 && !hasEntityResults && routeMatches.length === 0 ? (
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          ) : null}

          {!search.trim() && favoriteRoutes.length > 0 && (
            <CommandGroup heading="Atalhos">
              {favoriteRoutes.map((route) => (
                <CommandItem key={route.href} onSelect={() => runCommand(() => navigate(route.href))}>
                  <Star className="mr-2 h-4 w-4 text-amber-400" />
                  <span>{route.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!search.trim() && recentRoutes.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Recentes">
                {recentRoutes.map((route) => (
                  <CommandItem key={route.href} onSelect={() => runCommand(() => navigate(route.href))}>
                    <ArrowUpRight className="mr-2 h-4 w-4 text-primary" />
                    <span>{route.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {routeMatches.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Rotas do Admin">
                {routeMatches.map((route) => (
                  <CommandItem key={route.href} onSelect={() => runCommand(() => navigate(route.href))}>
                    <ArrowUpRight className="mr-2 h-4 w-4 text-primary" />
                    <span>{route.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {canAccessPath("/admin/clientes") && results.clientes.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Clientes">
                {results.clientes.map((cliente) => (
                  <CommandItem
                    key={cliente.id}
                    onSelect={() =>
                      runCommand(() => navigate("/admin/clientes", { state: { selectedId: cliente.id } }))
                    }
                  >
                    <Users className="mr-2 h-4 w-4 text-blue-400" />
                    <span>{cliente.nome}</span>
                    {cliente.email ? <span className="ml-auto text-xs text-white/40">{cliente.email}</span> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {canAccessPath("/admin/leads") && results.leads.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Leads">
                {results.leads.map((lead) => (
                  <CommandItem
                    key={lead.id}
                    onSelect={() => runCommand(() => navigate(`/admin/leads?lead=${lead.id}`))}
                  >
                    <Headphones className="mr-2 h-4 w-4 text-purple-400" />
                    <span>{lead.nome}</span>
                    <span className="ml-auto text-xs text-white/40">{lead.status || "lead"}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {canAccessPath("/admin/projetos") && results.projetos.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Projetos">
                {results.projetos.map((projeto) => (
                  <CommandItem key={projeto.id} onSelect={() => runCommand(() => navigate("/admin/projetos"))}>
                    <FolderKanban className="mr-2 h-4 w-4 text-emerald-400" />
                    <span>{projeto.titulo}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {canAccessPath("/admin/pedidos") && results.pedidos.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Pedidos">
                {results.pedidos.map((pedido) => (
                  <CommandItem key={pedido.id} onSelect={() => runCommand(() => navigate("/admin/pedidos"))}>
                    <ShoppingCart className="mr-2 h-4 w-4 text-amber-400" />
                    <span>Pedido #{pedido.codigo}</span>
                    {pedido.tipo ? <span className="ml-auto text-xs text-white/40">{pedido.tipo}</span> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {canAccessPath("/admin/financeiro") && results.financeiro.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Financeiro">
                {results.financeiro.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() =>
                      runCommand(() => navigate(`/admin/financeiro?status=${item.status || "todos"}`))
                    }
                  >
                    <FileText className="mr-2 h-4 w-4 text-emerald-300" />
                    <span>{item.descricao}</span>
                    <span className="ml-auto text-xs text-white/40">
                      {typeof item.valor === "number" ? `R$ ${item.valor.toLocaleString("pt-BR")}` : "Financeiro"}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          <CommandGroup heading="Navegação Rápida">
            {canAccessPath("/admin/financeiro") && (
              <CommandItem onSelect={() => runCommand(() => navigate("/admin/financeiro?status=pendente"))}>
                <DollarSign className="mr-2 h-4 w-4" />
                <span>Financeiro pendente</span>
              </CommandItem>
            )}
            {canAccessPath("/admin/leads") && (
              <CommandItem onSelect={() => runCommand(() => navigate("/admin/leads?preset=novos"))}>
                <Headphones className="mr-2 h-4 w-4" />
                <span>Leads novos</span>
              </CommandItem>
            )}
            {canAccessPath("/admin/projetos") && (
              <CommandItem onSelect={() => runCommand(() => navigate("/admin/projetos"))}>
                <FolderKanban className="mr-2 h-4 w-4" />
                <span>Projetos</span>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
