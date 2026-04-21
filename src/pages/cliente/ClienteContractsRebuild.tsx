import ContractsRebuildNotice from "@/components/ContractsRebuildNotice";

export default function ClienteContractsRebuild() {
  return (
    <ContractsRebuildNotice
      audienceLabel="Portal do Cliente"
      backHref="/cliente/dashboard"
      backLabel="Voltar ao painel"
    />
  );
}
