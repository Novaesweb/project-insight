import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Limpa service workers antigos para evitar cache quebrado/tela preta
// e mantém apenas o listener de áudio para notificações em páginas abertas.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => Promise.all(
        registrations.map((registration) => registration.unregister().catch(() => false))
      ))
      .catch(() => {});
  });

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "PUSH_NOTIFICATION_RECEIVED") {
      try {
        const audio = new Audio("/notification-sound.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (e) {
        console.warn("Audio interaction deferred:", e);
      }
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);



