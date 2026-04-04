import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const CHUNK_RELOAD_FLAG = "nw-chunk-reload";

function reloadForStaleChunk() {
  if (sessionStorage.getItem(CHUNK_RELOAD_FLAG) === "1") {
    sessionStorage.removeItem(CHUNK_RELOAD_FLAG);
    return;
  }

  sessionStorage.setItem(CHUNK_RELOAD_FLAG, "1");
  window.location.reload();
}

window.addEventListener("load", () => {
  sessionStorage.removeItem(CHUNK_RELOAD_FLAG);
});

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  reloadForStaleChunk();
});

window.addEventListener("unhandledrejection", (event) => {
  const reason =
    typeof event.reason === "string"
      ? event.reason
      : event.reason?.message || "";

  if (
    reason.includes("Failed to fetch dynamically imported module") ||
    reason.includes("Importing a module script failed") ||
    reason.includes("error loading dynamically imported module")
  ) {
    event.preventDefault();
    reloadForStaleChunk();
  }
});

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



