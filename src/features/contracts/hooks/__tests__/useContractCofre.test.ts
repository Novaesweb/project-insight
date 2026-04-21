import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useContractCofre } from "@/features/contracts/hooks/useContractCofre";

describe("useContractCofre", () => {
  it("returns safe defaults when called without input", () => {
    const { result } = renderHook(() => useContractCofre());

    expect(result.current.filteredContratos).toEqual([]);
    expect(result.current.activeContractsCount).toBe(0);
    expect(result.current.archivedContractsCount).toBe(0);
    expect(result.current.contractStatusCounts).toEqual({});
  });
});
