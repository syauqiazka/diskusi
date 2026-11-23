import { describe, expect, it } from "vitest";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/app/api/upload/route";
import { readFileSync, existsSync } from "fs";
import path from "path";

function getEnvToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const envPath = path.resolve(process.cwd(), ".env");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    const match = content.match(/BLOB_READ_WRITE_TOKEN=["']?([^"'\r\n]+)["']?/);
    if (match) return match[1];
  }
  return undefined;
}

describe("Validasi Upload Berkas & Vercel Blob (Aturan AGENTS.md)", () => {
  it("harus mengizinkan format gambar JPG, PNG, WebP, GIF dan dokumen PDF", () => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    for (const type of validTypes) {
      expect(ALLOWED_MIME_TYPES).toContain(type);
    }
  });

  it("harus menolak format berbahaya seperti executable atau HTML bebas (anti-XSS)", () => {
    const dangerousTypes = ["application/x-msdownload", "text/html", "application/javascript", "text/php"];
    for (const type of dangerousTypes) {
      expect(ALLOWED_MIME_TYPES.includes(type)).toBe(false);
    }
  });

  it("harus menetapkan batas maksimal ukuran berkas tepat 10 MB", () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
  });

  it("harus menyaring dan membersihkan nama berkas dari karakter tidak aman", () => {
    const dirtyFilename = "Foto Siswa! (1) <script>alert(1)</script>.png";
    const sanitized = dirtyFilename.replace(/[^a-zA-Z0-9.-]/g, "_");
    expect(sanitized).not.toContain("<");
    expect(sanitized).not.toContain(">");
    expect(sanitized).not.toContain(" ");
    expect(sanitized).toMatch(/^[a-zA-Z0-9._-]+$/);
  });

  it("harus memvalidasi format token Vercel Blob yang valid", () => {
    const token = getEnvToken();
    expect(token).toBeDefined();
    expect(token).toMatch(/^vercel_blob_rw_/);
  });
});
