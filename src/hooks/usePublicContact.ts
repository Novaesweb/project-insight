import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { APP_CONFIG } from "@/lib/constants";

const DEFAULT_WHATSAPP_NUMBER = "5551991189293";
const DEFAULT_CONTACT_EMAIL = "contato@novaesweb.site";
const CONTACT_KEYS = ["whatsapp_number", "email"] as const;

function sanitizePhone(value: string | null | undefined) {
  return String(value || "").replace(/\D/g, "");
}

export function usePublicContact() {
  const [contact, setContact] = useState({
    whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
    email: DEFAULT_CONTACT_EMAIL,
  });

  useEffect(() => {
    let active = true;

    supabase
      .from("app_config")
      .select("key, value")
      .in("key", [...CONTACT_KEYS])
      .then(({ data, error }) => {
        if (!active || error || !data) return;

        setContact((prev) => {
          const next = { ...prev };

          data.forEach((row) => {
            if (row.key === "whatsapp_number" && row.value) {
              next.whatsappNumber = sanitizePhone(row.value) || DEFAULT_WHATSAPP_NUMBER;
            }

            if (row.key === "email" && row.value) {
              next.email = row.value.trim().toLowerCase();
            }
          });

          return next;
        });
      });

    return () => {
      active = false;
    };
  }, []);

  const whatsappNumber = sanitizePhone(contact.whatsappNumber) || DEFAULT_WHATSAPP_NUMBER;
  const email = contact.email?.trim().toLowerCase() || DEFAULT_CONTACT_EMAIL;

  const buildWhatsAppUrl = (message: string) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return {
    whatsappNumber,
    email,
    siteUrl: APP_CONFIG.siteUrl,
    buildWhatsAppUrl,
  };
}
