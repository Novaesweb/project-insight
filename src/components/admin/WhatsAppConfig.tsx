import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function WhatsAppConfig() {
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("app_config")
      .select("value")
      .eq("key", "whatsapp_number")
      .single()
      .then(({ data }) => {
        if (data?.value) setNumber(data.value);
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("app_config")
      .upsert({ key: "whatsapp_number", value: number } as any, { onConflict: "key" });
    if (error) toast.error("Erro ao salvar: " + error.message);
    else toast.success("Número do WhatsApp atualizado!");
    setSaving(false);
  };

  if (loading) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Número do WhatsApp (com código do país)</Label>
        <Input
          placeholder="5511999999999"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Ex: 5511999999999 (55 = Brasil, 11 = DDD, número sem traços)
        </p>
      </div>
      <Button onClick={save} disabled={saving}>
        {saving ? "Salvando..." : "Salvar Número"}
      </Button>
    </div>
  );
}
