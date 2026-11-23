import { describe, it, expect } from "vitest";
import { proxy } from "@/proxy";
import { NextRequest } from "next/server";

describe("Alur Autentikasi dan Pemisahan Rute 2D / 3D", () => {
  it("mengarahkan pengguna yang belum login ke /masuk saat mencoba membuka rute 2D (/kelas)", () => {
    const req = new NextRequest("http://localhost:3000/kelas");
    const res = proxy(req);

    expect(res).toBeDefined();
    expect(res!.status).toBe(307); // Temporary Redirect
    const location = res!.headers.get("location");
    expect(location).toContain("/masuk");
    expect(location).toContain("callbackUrl=%2Fkelas");
  });

  it("mengarahkan pengguna yang belum login ke /masuk saat mencoba membuka rute 3D (/dunia)", () => {
    const req = new NextRequest("http://localhost:3000/dunia");
    const res = proxy(req);

    expect(res).toBeDefined();
    expect(res!.status).toBe(307);
    const location = res!.headers.get("location");
    expect(location).toContain("/masuk");
    expect(location).toContain("callbackUrl=%2Fdunia");
  });

  it("mengarahkan pengguna yang belum login saat mengakses mading, perpustakaan, pesan, dan profil", () => {
    const protectedPaths = ["/mading", "/perpustakaan", "/pesan", "/profil"];

    protectedPaths.forEach((path) => {
      const req = new NextRequest(`http://localhost:3000${path}`);
      const res = proxy(req);
      expect(res).toBeDefined();
      expect(res!.status).toBe(307);
      expect(res!.headers.get("location")).toContain("/masuk");
    });
  });

  it("mengizinkan akses ke rute terproteksi jika cookie sesi valid ditemukan", () => {
    const req = new NextRequest("http://localhost:3000/kelas", {
      headers: {
        cookie: "better-auth.session_token=valid_test_token_12345",
      },
    });
    const res = proxy(req);

    // NextResponse.next() tidak melakukan redirect
    expect(res?.status).not.toBe(307);
  });

  it("mengarahkan pengguna yang sudah login ke / saat membuka halaman /masuk atau /daftar", () => {
    const reqMasuk = new NextRequest("http://localhost:3000/masuk", {
      headers: {
        cookie: "better-auth.session_token=valid_test_token_12345",
      },
    });
    const resMasuk = proxy(reqMasuk);
    expect(resMasuk?.status).toBe(307);
    expect(resMasuk?.headers.get("location")).toBe("http://localhost:3000/");

    const reqDaftar = new NextRequest("http://localhost:3000/daftar", {
      headers: {
        cookie: "better-auth.session_token=valid_test_token_12345",
      },
    });
    const resDaftar = proxy(reqDaftar);
    expect(resDaftar?.status).toBe(307);
    expect(resDaftar?.headers.get("location")).toBe("http://localhost:3000/");
  });
});

