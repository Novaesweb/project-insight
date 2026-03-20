import { useState, useEffect } from "react";
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
import { Users, FolderKanban, ShoppingCart, Headphones, DollarSign, Search, Calendar, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{
    clientes: any[];
    projetos: any[];
    leads: any[];
    pedidos: any[];
  }>({
    clientes: [],
    projetos: [],
    leads: [],
    pedidos: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setResults({ clientes: [], projetos: [], leads: [], pedidos: [] });
      return;
    }

    const timer = setTimeout(async () => {
      const [cli, proj, lead, ped] = await Promise.all([
        supabase.from("clientes").select("id, nome").ilike("nome", `%${search}%`).limit(5),
        supabase.from("projetos").select("id, titulo").ilike("titulo", `%${search}%`).limit(5),
        supabase.from("leads").select("id, nome").ilike("nome", `%${search}%`).limit(5),
        supabase.from("pedidos").select("id, codigo").ilike("codigo", `%${search}%`).limit(5),
      ]);

      setResults({
        clientes: cli.data || [],
        projetos: proj.data || [],
        leads: lead.data || [],
        pedidos: ped.data || [],
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <Button
        variant="ghost"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-white/5 border border-white/10 text-sm text-white/50 shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Pesquisar...</span>
        <span className="inline-flex lg:hidden">Busca</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="O que você está procurando?" 
          value={search}
          onValueChange={setSearch}
          className="text-white"
        />
        <CommandList className="text-white">
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          
          {results.clientes.length > 0 && (
            <CommandGroup heading="Clientes">
              {results.clientes.map((c) => (
                <CommandItem key={c.id} onSelect={() => runCommand(() => navigate(`/admin/clientes`))}>
                  <Users className="mr-2 h-4 w-4 text-blue-400" />
                  <span>{c.nome}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.projetos.length > 0 && (
            <CommandGroup heading="Projetos">
              {results.projetos.map((p) => (
                <CommandItem key={p.id} onSelect={() => runCommand(() => navigate(`/admin/projetos`))}>
                  <FolderKanban className="mr-2 h-4 w-4 text-emerald-400" />
                  <span>{p.titulo}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.leads.length > 0 && (
            <CommandGroup heading="Leads">
              {results.leads.map((l) => (
                <CommandItem key={l.id} onSelect={() => runCommand(() => navigate(`/admin/leads`))}>
                  <Star className="mr-2 h-4 w-4 text-purple-400" />
                  <span>{l.nome}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.pedidos.length > 0 && (
            <CommandGroup heading="Pedidos">
              {results.pedidos.map((pd) => (
                <CommandItem key={pd.id} onSelect={() => runCommand(() => navigate(`/admin/pedidos`))}>
                  <ShoppingCart className="mr-2 h-4 w-4 text-amber-400" />
                  <span>Pedido #{pd.codigo}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />
          <CommandGroup heading="Navegação Rápida">
            <CommandItem onSelect={() => runCommand(() => navigate("/admin/agenda"))}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Agenda</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/admin/financeiro"))}>
              <DollarSign className="mr-2 h-4 w-4" />
              <span>Financeiro</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/admin/suporte"))}>
              <Headphones className="mr-2 h-4 w-4" />
              <span>Suporte</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function Button({ className, variant, children, onClick }: any) {
  return (
    <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}
