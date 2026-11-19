import { describe, expect, it } from "vitest";
import { THEME_TOKENS } from "@/lib/tokens";

describe("Token Desain (DESIGN.md)", () => {
  it("harus memiliki token warna ergonomis sesuai spesifikasi DESIGN.md terbaru", () => {
    expect(THEME_TOKENS.colors.night).toBe("#FFFFFF");
    expect(THEME_TOKENS.colors.canvas).toBe("#F8FAFC");
    expect(THEME_TOKENS.colors.fluor).toBe("#0F172A");
    expect(THEME_TOKENS.colors.caution).toBe("#B45309");
    expect(THEME_TOKENS.colors.neonCyan).toBe("#0284C7");
    expect(THEME_TOKENS.colors.neonPink).toBe("#E11D48");
    expect(THEME_TOKENS.colors.alert).toBe("#DC2626");
    expect(THEME_TOKENS.colors.ok).toBe("#16A34A");
  });

  it("harus memiliki variabel font yang tepat untuk HUD, Rambu, Body, dan Mono", () => {
    expect(THEME_TOKENS.fonts.hud).toBe("var(--font-vt323)");
    expect(THEME_TOKENS.fonts.sign).toBe("var(--font-anton)");
    expect(THEME_TOKENS.fonts.body).toBe("var(--font-instrument-sans)");
    expect(THEME_TOKENS.fonts.mono).toBe("var(--font-jetbrains-mono)");
  });
});
