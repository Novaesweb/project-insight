import { afterEach, describe, expect, it, vi } from "vitest";

import { getContractAdminSafeMessage, logContractAdminError } from "../debug";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("contract admin diagnostics", () => {
  it("classifies auth/session failures with a safe message", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const entry = logContractAdminError("contracts-bootstrap", new Error("JWT expired while loading contracts"));

    expect(entry.reason).toBe("auth");
    expect(entry.safeMessage).toBe(getContractAdminSafeMessage("auth"));
    expect(entry.reference).toMatch(/^CTR-/);
    expect(errorSpy).toHaveBeenCalledOnce();
  });

  it("classifies network failures with a safe message", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const entry = logContractAdminError("contracts-preview", {
      message: "Failed to fetch",
      status: 504,
      code: "NETWORK_TIMEOUT",
    });

    expect(entry.reason).toBe("network");
    expect(entry.safeMessage).toBe(getContractAdminSafeMessage("network"));
  });
});
