import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PWAHandler() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Se NÃO for caminho administrativo, bloqueia o prompt automático do navegador
      if (!isAdminPath) {
        e.preventDefault();
        console.log("PWA Install prompt blocked on public site.");
        return false;
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isAdminPath]);

  return null;
}
