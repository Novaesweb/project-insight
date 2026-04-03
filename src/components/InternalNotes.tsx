import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Pin, Send, Trash2, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface InternalNotesProps {
  entityType: "cliente" | "lead" | "ticket";
  entityId: string;
}

interface Note {
  id: string;
  content: string;
  created_by: string;
  pinned: boolean;
  created_at: string;
}

export default function InternalNotes({ entityType, entityId }: InternalNotesProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("internal_notes" as any)
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    setNotes((data as any) || []);
  }, [entityId, entityType]);

  useEffect(() => { if (entityId) void load(); }, [entityId, load]);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("internal_notes" as any).insert({
      entity_type: entityType,
      entity_id: entityId,
      content: text.trim(),
      created_by: "admin",
    } as any);
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setText("");
    void load();
  };

  const togglePin = async (id: string, current: boolean) => {
    await supabase.from("internal_notes" as any).update({ pinned: !current } as any).eq("id", id);
    void load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("internal_notes" as any).delete().eq("id", id);
    void load();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <StickyNote className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Observações Internas</h3>
        <Badge variant="secondary" className="text-[10px]">{notes.length}</Badge>
      </div>

      <div className="flex gap-2">
        <Textarea
          placeholder="Adicionar observação..."
          className="glass-input border-[rgba(255,255,255,0.1)] text-white text-xs min-h-[60px] flex-1 resize-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleAdd(); }}
        />
        <Button size="sm" className="gradient-primary border-0 text-white h-auto" onClick={handleAdd} disabled={saving || !text.trim()}>
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>

      {notes.length === 0 ? (
        <p className="text-xs text-[hsl(var(--muted-foreground))] text-center py-4">Nenhuma observação ainda</p>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {notes.map((n) => (
            <div key={n.id} className={cn(
              "p-2.5 rounded-lg border text-xs space-y-1",
              n.pinned ? "border-amber-500/30 bg-amber-500/5" : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
            )}>
              <p className="text-white/90 whitespace-pre-wrap">{n.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                  {new Date(n.created_at).toLocaleDateString("pt-BR")} · {n.created_by}
                </span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className={cn("h-5 w-5", n.pinned ? "text-amber-400" : "text-white/30")} onClick={() => togglePin(n.id, n.pinned)}>
                    <Pin className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-5 w-5 text-red-400/50 hover:text-red-400" onClick={() => handleDelete(n.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
