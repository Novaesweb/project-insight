import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function WhatsAppFloat() {
  const [number, setNumber] = useState("");

  useEffect(() => {
    supabase
      .from("app_config")
      .select("value")
      .eq("key", "whatsapp_number")
      .single()
      .then(({ data }) => {
        if (data?.value) setNumber(data.value);
      });
  }, []);

  if (!number) return null;

  const url = `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Vim pelo site da NovaesWeb e gostaria de saber mais.")}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-green-500/30 hover:scale-110 transition-transform"
      style={{ background: "linear-gradient(135deg, #25d366, #128c7e)" }}
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white fill-white" />
    </a>
  );
}
