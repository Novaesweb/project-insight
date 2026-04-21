import { describe, expect, it } from "vitest";
import { isOwnerAdminEmail, normalizeAdminRole } from "@/lib/admin-permissions";

describe("normalizeAdminRole", () => {
  it("accepts canonical values with spacing and case differences", () => {
    expect(normalizeAdminRole(" admin ")).toBe("admin");
    expect(normalizeAdminRole("EDITOR")).toBe("editor");
    expect(normalizeAdminRole(" Visualizador ")).toBe("visualizador");
  });

  it("maps legacy admin aliases to admin", () => {
    expect(normalizeAdminRole("Administrador")).toBe("admin");
    expect(normalizeAdminRole("super_admin")).toBe("admin");
    expect(normalizeAdminRole("owner")).toBe("admin");
  });

  it("falls back safely for unknown roles", () => {
    expect(normalizeAdminRole("qualquer-coisa")).toBe("visualizador");
    expect(normalizeAdminRole(null)).toBe("visualizador");
  });
});

describe("isOwnerAdminEmail", () => {
  it("recognizes the principal admin email", () => {
    expect(isOwnerAdminEmail("  NovaesWeb@gmail.com ")).toBe(true);
  });

  it("rejects any other email", () => {
    expect(isOwnerAdminEmail("contato@empresa.com")).toBe(false);
  });
});
