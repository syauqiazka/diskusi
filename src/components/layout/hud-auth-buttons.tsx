"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, LogOut, User } from "lucide-react";
import { authClient, signOut } from "@/lib/auth/auth-client";
import { Badge } from "@/components/ui/badge";

export function HudAuthButtons() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/masuk");
      router.refresh();
    } catch (err) {
      console.error("Gagal keluar:", err);
      router.push("/masuk");
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center space-x-2 font-body text-xs text-text-muted animate-pulse">
        <span>Memeriksa akun...</span>
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center space-x-2 sm:space-x-3 font-body text-xs">
        <Link
          href="/profil"
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-2xl border-2 border-border bg-surface hover:border-primary/50 text-text transition-all font-bold shadow-2xs"
          title="Buka profil siswa"
        >
          <User className="w-4 h-4 text-primary" />
          <span className="truncate max-w-[100px] sm:max-w-[140px]">
            {session.user.name}
          </span>
          <Badge
            variant={
              (session.user as { role?: string })?.role === "SUPERADMIN"
                ? "mint"
                : (session.user as { role?: string })?.role === "ADMIN"
                ? "peach"
                : "default"
            }
            className="text-[10px] py-0 px-2"
          >
            {(session.user as { role?: string })?.role === "SUPERADMIN"
              ? "Super Admin"
              : (session.user as { role?: string })?.role === "ADMIN"
              ? "Guru"
              : "Siswa"}
          </Badge>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-2xl border-2 border-border bg-surface text-text-muted hover:text-destructive hover:border-destructive/30 transition-all font-bold cursor-pointer"
          title="Keluar dari akun"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 sm:space-x-2.5 font-body text-xs font-bold">
      <Link
        href="/masuk"
        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl border-2 border-border bg-surface text-text hover:border-accent hover:text-accent transition-all"
      >
        <LogIn className="w-4 h-4" />
        <span>Masuk</span>
      </Link>

      <Link
        href="/daftar"
        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-accent text-white hover:bg-accent/90 border-b-2 border-indigo-900 transition-all shadow-xs"
      >
        <UserPlus className="w-4 h-4" />
        <span>Daftar Siswa</span>
      </Link>
    </div>
  );
}
