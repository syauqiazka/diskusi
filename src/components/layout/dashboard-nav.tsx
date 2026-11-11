"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, GraduationCap, LayoutGrid, User, LogOut, Compass } from "lucide-react";
import { authClient, signOut } from "@/lib/auth/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    label: "[00] DUNIA 3D (LORONG)",
    href: "/dunia",
    icon: Compass,
  },
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
    label: "[04] LOKER & PROFIL",
    href: "/profil",
    icon: User,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="border-b border-fluor/20 bg-night/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
          {/* Navigasi Tab Mode Cepat */}
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
                </Link>
              );
            })}
          </nav>

          {/* Info Status Pengguna & Signout */}
          <div className="flex items-center space-x-3 self-end md:self-auto font-mono text-xs">
            {isPending ? (
              <span className="text-fluor/40">Memeriksa sesi...</span>
            ) : session?.user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-none bg-ok inline-block animate-pulse" />
                  <span className="text-fluor font-medium">{session.user.name}</span>
                </div>
                <Badge variant="outline">
                  {(session.user as { role?: string }).role || "STUDENT"}
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

