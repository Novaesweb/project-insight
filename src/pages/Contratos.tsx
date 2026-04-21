import { useCallback, useState, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import ErrorBoundary from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import ContractsPage from "@/features/contracts/ContractsPage";
import { logContractAdminError, type ContractAdminDebugEntry } from "@/features/contracts/debug";

function ContractsCrashFallback({ debugEntry }: { debugEntry: ContractAdminDebugEntry | null }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-3xl border border-red-500/20 bg-[#120d18] p-6 text-white shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold">Falha ao montar o painel de contratos</h1>
        <p className="mt-2 text-sm text-white/70">
          O erro foi interceptado antes de derrubar toda a area administrativa. Recarregue a pagina e, se o problema
          continuar, use a referencia abaixo para localizar a causa mais rapido.
        </p>
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
          <p className="font-medium text-white">Referencia de diagnostico</p>
          <p className="mt-1 font-mono text-xs text-white/60">{debugEntry?.reference || "CTR-CONTRACTS-PENDING"}</p>
          <p className="mt-3">{debugEntry?.safeMessage || "Falha inesperada durante a renderizacao do painel."}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Recarregar pagina
          </Button>
          <Button type="button" variant="outline" onClick={() => window.location.assign("/admin/contratos")}>
            Voltar para contratos
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ContratosRoutePage() {
  const [debugEntry, setDebugEntry] = useState<ContractAdminDebugEntry | null>(null);

  const handleBoundaryError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    setDebugEntry(
      logContractAdminError("contracts-route-crash", error, {
        componentStack: errorInfo.componentStack,
      }),
    );
  }, []);

  return (
    <ErrorBoundary onError={handleBoundaryError} fallback={<ContractsCrashFallback debugEntry={debugEntry} />}>
      <ContractsPage />
    </ErrorBoundary>
  );
}
