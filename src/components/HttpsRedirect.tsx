import { useEffect } from "react";

export default function HttpsRedirect({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "http:" &&
      !window.location.hostname.includes("localhost") &&
      !window.location.hostname.includes("127.0.0.1")
    ) {
      console.log("🔒 novaesweb Security: Redirecting to HTTPS...");
      window.location.href = `https:${window.location.href.substring(window.location.protocol.length)}`;
    }
  }, []);

  return <>{children}</>;
}



