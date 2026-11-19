"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, GraduationCap, LayoutGrid, User, LogOut, Compass, MessageSquare } from "lucide-react";
import { authClient, signOut } from "@/lib/auth/auth-client";
import { getUnreadMessagesCount } from "@/lib/chat/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    label: "[01] KELAS SAYA",
    href: "/kelas",
    icon: GraduationCap,
  },
  {
    label: "[02] MADING (GLOBAL)",
    href: "/mading",
    icon: LayoutGrid,
  },
  {
    label: "[03] PERPUSTAKAAN",
    href: "/perpustakaan",
    icon: BookOpen,
  },
  {
    label: "[04] PESAN KELAS",
    href: "/pesan",
    icon: MessageSquare,
  },
  {
    label: "[05] LOKER & PROFIL",
    href: "/profil",
    icon: User,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Ambil jumlah pesan belum dibaca saat navigasi berubah
  React.useEffect(() => {
    if (!session?.user) return;
    getUnreadMessagesCount()
      .then((count) => setUnreadCount(count))
      .catch(() => {});
  }, [session?.user, pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="border-b border-fluor/20 bg-night/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between py-3 gap-3">
          {/* Navigasi Tab Mode 2D */}
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/kelas" && pathname.startsWith(item.href)) ||
                (item.href === "/kelas" && pathname.startsWith("/kelas"));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center space-x-2 px-3.5 py-1.5 border font-mono text-xs uppercase tracking-wider transition-colors ${
                    isActive
                      ? "border-caution text-caution bg-caution/10 font-bold"
                      : "border-fluor/20 text-fluor/70 hover:border-fluor/50 hover:text-fluor bg-night"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.href === "/pesan" && unreadCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-alert text-night font-bold text-[10px] rounded-full animate-pulse shadow-[0_0_8px_rgba(224,65,47,0.7)]">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Switcher ke Dunia 3D & Status Pengguna */}
          <div className="flex flex-wrap items-center gap-3 self-end lg:self-auto font-mono text-xs">
            {/* Tombol Pemisah Tegas ke Dunia 3D */}
            <Link href="/dunia">
              <Button
                variant="default"
                size="sm"
                className="bg-caution text-night hover:bg-caution/90 border border-caution font-hud tracking-wider text-sm flex items-center space-x-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>[E] MASUK DUNIA 3D</span>
              </Button>
            </Link>

            {isPending ? (
              <span className="text-fluor/40">Memeriksa sesi...</span>
            ) : session?.user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 px-2 py-1 border border-fluor/20 bg-night">
                  <span className="w-2 h-2 bg-ok inline-block animate-pulse" />
                  <span className="text-fluor font-medium">{session.user.name}</span>
                </div>
                <Badge
                  variant={
                    (session.user as { role?: string }).role === "SUPERADMIN"
                      ? "ok"
                      : (session.user as { role?: string }).role === "ADMIN"
                      ? "cyan"
                      : "outline"
                  }
                >
                  {(session.user as { role?: string }).role === "SUPERADMIN"
                    ? "SUPER ADMIN"
                    : (session.user as { role?: string }).role === "ADMIN"
                    ? "ADMIN (GURU/STAF)"
                    : "SISWA"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-8 px-2 text-fluor/60 hover:text-alert"
                  title="Keluar dari sesi"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  <span>KELUAR</span>
                </Button>
              </div>
            ) : (
              <Link
                href="/masuk"
                className="text-caution hover:underline uppercase tracking-wider"
              >
                [MASUK UNTUK BERINTERAKSI]
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
