import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isAuthPage = pathname.startsWith("/masuk") || pathname.startsWith("/daftar");
  const isPreview = request.nextUrl.searchParams.get("preview") === "true";
  if (isPreview) return NextResponse.next();

  const isProtectedPage =
    pathname.startsWith("/dunia") ||
    pathname.startsWith("/kelas") ||
    pathname.startsWith("/mading") ||
    pathname.startsWith("/perpustakaan") ||
    pathname.startsWith("/pesan") ||
    pathname.startsWith("/profil");

  // Jika belum login dan mencoba mengakses halaman terproteksi -> redirect ke /masuk
  if (isProtectedPage && !sessionToken) {
    const url = new URL("/masuk", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Jika sudah login dan mencoba membuka halaman masuk/daftar -> redirect ke /
  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dunia/:path*",
    "/kelas/:path*",
    "/mading/:path*",
    "/perpustakaan/:path*",
    "/pesan/:path*",
    "/profil/:path*",
    "/masuk",
    "/daftar",
  ],
};
