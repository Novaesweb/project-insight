import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * PWAHandler
 * Gerencia o comportamento de instalação do PWA.
 * O objetivo é impedir que o prompt de instalação apareça no site público,
 * permitindo-o apenas dentro das rotas administrativas (/admin).
 */

// Armazena o evento globalmente para não perdê-lo durante navegação inicial
let deferredPrompt: any = null;

// Captura o evento o mais cedo possível
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    // Sempre previne o prompt automático por padrão
    e.preventDefault();
    // Guarda o evento para uso posterior
    deferredPrompt = e;
    console.log("PWA: beforeinstallprompt capturado e guardado.");
  });
}

export default function PWAHandler() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const hasPromptedRef = useRef(false);

  useEffect(() => {
    // Se estivermos no admin e tivermos um prompt guardado que ainda não foi usado
    if (isAdminPath && deferredPrompt && !hasPromptedRef.current) {
      console.log("PWA: Usuário no Admin. Prompt disponível.");
      
      // Opcional: Aqui poderíamos disparar o prompt automaticamente ou 
      // apenas permitir que botões de instalação funcionem.
      // O Chrome geralmente exige interação do usuário para .prompt(),
      // mas ao não dar preventDefault() aqui (se re-disparado), ele apareceria.
      
      // Se quisermos que o navegador mostre o prompt "naturalmente" ao entrar no admin,
      // precisaríamos que o evento disparasse agora. Como ele já disparou,
      // o desenvolvedor geralmente chama deferredPrompt.prompt() em um botão.
    }

    if (!isAdminPath && deferredPrompt) {
      console.log("PWA: Bloqueando prompt em área pública.");
      // Já demos preventDefault globalmente, então aqui apenas garantimos silêncio.
    }
  }, [isAdminPath]);

  // Listener para capturar o evento caso ele ocorra após a montagem do componente
  useEffect(() => {
    const handlePrompt = (e: any) => {
      if (!location.pathname.startsWith("/admin")) {
        e.preventDefault();
        deferredPrompt = e;
        console.log("PWA: Prompt bloqueado via componente (área pública).");
      } else {
        deferredPrompt = e;
        console.log("PWA: Prompt permitido via componente (área admin).");
      }
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, [location.pathname]);

  return null;
}
