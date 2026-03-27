import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Play notification sound when push arrives and app is open
if ("serviceWorker" in navigator) {
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



