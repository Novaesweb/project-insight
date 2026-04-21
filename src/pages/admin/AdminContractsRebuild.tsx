import ContractsRebuildNotice from "@/components/ContractsRebuildNotice";

export default function AdminContractsRebuild() {
  return (
    <ContractsRebuildNotice
      audienceLabel="Painel Administrativo"
      backHref="/admin"
      backLabel="Voltar ao dashboard"
    />
  );
}
