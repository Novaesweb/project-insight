import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useBranding() {
  const [branding, setBranding] = useState({
    logo: "",
    primary_color: "#e8334a",
    nome: "novaesweb"
  });

  useEffect(() => {
    const fetchBranding = async () => {
      const { data } = await supabase
        .from("app_config")
        .select("key, value")
        .in("key", ["logo", "primary_color", "nome"]);

      if (data) {
        const newBranding = { ...branding };
        data.forEach((row) => {
          if ((newBranding as any)[row.key] !== undefined) {
             (newBranding as any)[row.key] = row.value;
          }
        });
        setBranding(newBranding);
        applyTheme(newBranding.primary_color);
      }
    };

    fetchBranding();

    // Realtime subscription
    const channel = supabase
      .channel("branding_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_config" },
        (payload: any) => {
          const { key, value } = payload.new;
          if (["logo", "primary_color", "nome"].includes(key)) {
            setBranding((prev) => {
              const next = { ...prev, [key]: value };
              if (key === "primary_color") applyTheme(value);
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const applyTheme = useCallback((hex: string) => {
    if (!hex) return;
    
    // Convert hex to HSL for Shadcn
    const hsl = hexToHsl(hex);
    if (hsl) {
      document.documentElement.style.setProperty("--primary", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      // Optional: adjust other variables if needed (ring, etc)
      document.documentElement.style.setProperty("--ring", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    }
  }, []);

  return branding;
}

function hexToHsl(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}



