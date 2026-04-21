import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContractCofreList } from "@/features/contracts/components/ContractCofreList";

describe("ContractCofreList", () => {
  it("renders the empty state when props are missing", () => {
    render(<ContractCofreList {...({} as any)} />);

    expect(screen.getByText(/nenhum contrato encontrado/i)).toBeInTheDocument();
  });
});
