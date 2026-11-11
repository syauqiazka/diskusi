import { describe, expect, it } from "vitest";
import { THEME_TOKENS } from "@/lib/tokens";

describe("Token Desain (DESIGN.md)", () => {
  it("harus memiliki token warna yang tepat sesuai spesifikasi DESIGN.md", () => {
    expect(THEME_TOKENS.colors.night).toBe("#0B0D12");
    expect(THEME_TOKENS.colors.fluor).toBe("#E9F2E3");
    expect(THEME_TOKENS.colors.caution).toBe("#F2C200");
    expect(THEME_TOKENS.colors.neonCyan).toBe("#5CE1FF");
    expect(THEME_TOKENS.colors.neonPink).toBe("#FF5C93");
    expect(THEME_TOKENS.colors.alert).toBe("#E0412F");
    expect(THEME_TOKENS.colors.ok).toBe("#4FD08A");
  });

  it("harus memiliki variabel font yang tepat untuk HUD, Rambu, Body, dan Mono", () => {
    expect(THEME_TOKENS.fonts.hud).toBe("var(--font-vt323)");
    expect(THEME_TOKENS.fonts.sign).toBe("var(--font-anton)");
    expect(THEME_TOKENS.fonts.body).toBe("var(--font-instrument-sans)");
    expect(THEME_TOKENS.fonts.mono).toBe("var(--font-jetbrains-mono)");
  });
});
