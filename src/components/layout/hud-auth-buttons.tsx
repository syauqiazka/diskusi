"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, LogOut, User } from "lucide-react";
import { authClient, signOut } from "@/lib/auth/auth-client";

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
      <div className="flex items-center space-x-2 font-mono text-xs text-fluor/40 animate-pulse">
        <span>MEMERIKSA AKUN...</span>
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center space-x-2 sm:space-x-3 font-mono text-xs">
        <Link
          href="/profil"
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 border border-caution/60 bg-caution/10 text-caution hover:bg-caution hover:text-night transition-colors font-bold"
          title="Buka profil siswa"
        >
          <User className="w-3.5 h-3.5" />
          <span className="truncate max-w-[100px] sm:max-w-[150px] uppercase">
            {session.user.name}
          </span>
          <span className="text-[10px] px-1 py-0.5 border border-caution/40 bg-night text-fluor/90 font-normal">
            {(session.user as { role?: string })?.role === "SUPERADMIN"
              ? "SUPER ADMIN"
              : (session.user as { role?: string })?.role === "ADMIN"
              ? "GURU/STAF"
              : "SISWA"}
          </span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center space-x-1 px-2.5 py-1 border border-alert/50 bg-alert/10 text-alert hover:bg-alert hover:text-night transition-colors font-bold uppercase tracking-wider cursor-pointer"
          title="Keluar dari akun"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">KELUAR</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 sm:space-x-3 font-mono text-xs">
      <Link
        href="/masuk"
        className="inline-flex items-center space-x-1 px-3 py-1.5 border border-fluor/30 hover:border-caution hover:text-caution transition-colors"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span className="uppercase tracking-wider font-semibold">Masuk</span>
      </Link>

      <Link
        href="/daftar"
        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-caution text-night border border-caution hover:bg-caution/90 transition-colors font-semibold"
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span className="uppercase tracking-wider font-bold">Daftar</span>
      </Link>
    </div>
  );
}

