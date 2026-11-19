import { describe, expect, it } from "vitest";
import { THEME_TOKENS } from "@/lib/tokens";

describe("Token Desain (DESIGN.md - Fresh Mint & Peach)", () => {
  it("harus memiliki token warna Fresh Mint & Peach sesuai spesifikasi DESIGN.md baru", () => {
    expect(THEME_TOKENS.colors.canvas).toBe("#F0FDF4");
    expect(THEME_TOKENS.colors.surface).toBe("#FFFFFF");
    expect(THEME_TOKENS.colors.primary).toBe("#34D399");
    expect(THEME_TOKENS.colors.secondary).toBe("#FDBA74");
    expect(THEME_TOKENS.colors.accent).toBe("#4F46E5");
    expect(THEME_TOKENS.colors.text).toBe("#0F172A");
    expect(THEME_TOKENS.colors.textMuted).toBe("#64748B");
    expect(THEME_TOKENS.colors.border).toBe("#E2E8F0");
    expect(THEME_TOKENS.colors.destructive).toBe("#EF4444");
    expect(THEME_TOKENS.colors.success).toBe("#10B981");
  });

  it("harus memiliki variabel font Fredoka, Nunito, dan JetBrains Mono", () => {
    expect(THEME_TOKENS.fonts.display).toBe("var(--font-fredoka)");
    expect(THEME_TOKENS.fonts.body).toBe("var(--font-nunito)");
    expect(THEME_TOKENS.fonts.mono).toBe("var(--font-jetbrains-mono)");
  });
});
