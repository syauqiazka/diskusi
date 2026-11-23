"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, GraduationCap, LayoutGrid, User, MessageSquare } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { getUnreadMessagesCount } from "@/lib/chat/actions";

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
  const { data: session } = authClient.useSession();
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Ambil jumlah pesan belum dibaca saat navigasi berubah
  React.useEffect(() => {
    if (!session?.user) return;
    getUnreadMessagesCount()
      .then((count) => setUnreadCount(count))
      .catch(() => {});
  }, [session?.user, pathname]);

  return (
    <div className="border-b-2 border-border bg-surface/80 backdrop-blur-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 overflow-x-auto no-scrollbar">
          {/* Navigasi Tab Mode 2D Bersahabat (Tanpa duplikasi 3D & akun profil yang sudah ada di bar atas) */}
          <nav className="flex items-center gap-2 shrink-0">
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
                  className={`inline-flex items-center space-x-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl font-body text-xs font-bold transition-all border-2 ${
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
        </div>
      </div>
    </div>
  );
}
