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
    label: "Kelas Saya",
    href: "/kelas",
    icon: GraduationCap,
  },
  {
    label: "Mading Forum",
    href: "/mading",
    icon: LayoutGrid,
  },
  {
    label: "Perpustakaan",
    href: "/perpustakaan",
    icon: BookOpen,
  },
  {
    label: "Pesan Pribadi",
    href: "/pesan",
    icon: MessageSquare,
  },
  {
    label: "Loker Profil",
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
    <div className="border-b-2 border-border bg-surface/80 backdrop-blur-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between py-3 gap-3">
          {/* Navigasi Tab Mode 2D Bersahabat */}
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
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-2xl font-body text-xs font-bold transition-all border-2 ${
                    isActive
                      ? "bg-primary/20 text-emerald-900 border-primary shadow-xs"
                      : "bg-surface text-text-muted hover:text-text hover:bg-canvas border-border"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-primary" />
                  <span>{item.label}</span>
                  {item.href === "/pesan" && unreadCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-destructive text-white font-bold text-[10px] rounded-full animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Switcher ke Dunia 3D & Status Pengguna */}
          <div className="flex flex-wrap items-center gap-3 self-end lg:self-auto text-xs font-body">
            {/* Tombol ke Dunia 3D */}
            <Link href="/dunia">
              <Button
                variant="mint"
                size="sm"
                className="flex items-center space-x-1.5 px-4 rounded-xl"
              >
                <Compass className="w-4 h-4 animate-spin-slow" />
                <span>Dunia 3D</span>
              </Button>
            </Link>

            {isPending ? (
              <span className="text-text-muted">Memeriksa akun...</span>
            ) : session?.user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-border bg-canvas">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span className="text-text font-bold text-xs truncate max-w-[120px]">
                    {session.user.name}
                  </span>
                </div>
                <Badge
                  variant={
                    (session.user as { role?: string }).role === "SUPERADMIN"
                      ? "mint"
                      : (session.user as { role?: string }).role === "ADMIN"
                      ? "peach"
                      : "default"
                  }
                >
                  {(session.user as { role?: string }).role === "SUPERADMIN"
                    ? "Super Admin"
                    : (session.user as { role?: string }).role === "ADMIN"
                    ? "Guru / Staf"
                    : "Siswa"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-8 px-2 text-text-muted hover:text-destructive"
                  title="Keluar dari akun"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  <span>Keluar</span>
                </Button>
              </div>
            ) : (
              <Link
                href="/masuk"
                className="font-display text-accent hover:underline"
              >
                Masuk Akun
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
