import ErrorBoundary from "@/components/ErrorBoundary";
import ContractsPage from "@/features/contracts/ContractsPage";

export default function ContratosPage() {
  return (
    <ErrorBoundary>
      <ContractsPage />
    </ErrorBoundary>
  );
}
