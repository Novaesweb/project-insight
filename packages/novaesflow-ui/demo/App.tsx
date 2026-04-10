import { useMemo, useState, type CSSProperties } from "react";

import { NovaesFlowBuilder, type NovaesFlowConfig, type NovaesFlowFinishPayload } from "../src";
import { buildMockConfig } from "./mock-config";
import { buildSupabaseDemoConfig } from "./supabase-config";

const frameStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#050505",
  padding: "24px 0",
};

const buttonStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  borderRadius: 999,
  padding: "10px 14px",
  cursor: "pointer",
};

export default function App() {
  const [mode, setMode] = useState<"mock" | "supabase">("mock");
  const [lastPayload, setLastPayload] = useState<NovaesFlowFinishPayload | null>(null);

  const baseHandler = (payload: NovaesFlowFinishPayload) => {
    setLastPayload(payload);
  };

  const config = useMemo<NovaesFlowConfig>(() => {
    if (mode === "supabase") {
      return buildSupabaseDemoConfig(baseHandler);
    }

    return buildMockConfig(baseHandler);
  }, [mode]);

  return (
    <div style={frameStyle}>
      <div
        style={{
          width: "min(1320px, calc(100vw - 24px))",
          margin: "0 auto",
          display: "grid",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "center",
            color: "#fff",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          <div>
            <strong>NovaesFlow UI Demo</strong>
            <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.72)" }}>
              Alterna entre modo local e exemplo com adapter Supabase.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" style={buttonStyle} onClick={() => setMode("mock")}>
              Mock/local
            </button>
            <button type="button" style={buttonStyle} onClick={() => setMode("supabase")}>
              Supabase
            </button>
          </div>
        </div>

        <NovaesFlowBuilder config={config} />

        {lastPayload ? (
          <pre
            style={{
              margin: 0,
              padding: 18,
              borderRadius: 20,
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              overflow: "auto",
            }}
          >
            {JSON.stringify(lastPayload, null, 2)}
          </pre>
        ) : null}
      </div>
    </div>
  );
}
