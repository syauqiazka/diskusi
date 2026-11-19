"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  ShieldAlert,
  User,
  Check,
  Loader2,
  Lock,
  Users,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  switchMyRole,
  getAllUsersForRoleManagement,
  assignUserRole,
  type UserManagementItem,
} from "@/lib/user/role-actions";

interface RoleSwitcherProps {
  currentRole?: string;
  isSuperAdmin?: boolean;
  onRoleChanged?: (newRole: "SUPERADMIN" | "ADMIN" | "USER") => void;
}

export function RoleSwitcher({
  currentRole = "USER",
  isSuperAdmin = false,
  onRoleChanged,
}: RoleSwitcherProps) {
  const router = useRouter();
  const [activeRole, setActiveRole] = React.useState<"SUPERADMIN" | "ADMIN" | "USER">(
    (currentRole.toUpperCase() as "SUPERADMIN" | "ADMIN" | "USER") || "USER"
  );
  const [isPending, startTransition] = React.useTransition();
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);

  // State untuk Panel Kelola Pengguna Super Admin
  const [userList, setUserList] = React.useState<UserManagementItem[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(false);
  const [userSearch, setUserSearch] = React.useState("");
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isSuperAdmin) {
      setIsLoadingUsers(true);
      getAllUsersForRoleManagement()
        .then((res) => {
          if (res.success && res.users) {
            setUserList(res.users);
          }
        })
        .finally(() => setIsLoadingUsers(false));
    }
  }, [isSuperAdmin]);

  const roles = [
    {
      id: "SUPERADMIN" as const,
      label: "SUPER ADMIN",
      badgeVariant: "ok" as const,
      icon: ShieldAlert,
      desc: "Pengelola Sistem & Hak Akses Tertinggi",
    },
    {
      id: "ADMIN" as const,
      label: "ADMIN (GURU & STAF)",
      badgeVariant: "cyan" as const,
      icon: Shield,
      desc: "Pengajar, Guru & Jajaran Staf Sekolah",
    },
    {
      id: "USER" as const,
      label: "SISWA",
      badgeVariant: "outline" as const,
      icon: User,
      desc: "Akun Pengguna Siswa SMK TI BAZMA",
    },
  ];

  // Khusus Super Admin: Uji beralih peran akun aktif
  const handleSelectRole = (newRole: "SUPERADMIN" | "ADMIN" | "USER") => {
    if (newRole === activeRole) return;
    setStatusMsg(null);

    startTransition(async () => {
      const res = await switchMyRole(newRole);
      if (res.success) {
        setActiveRole(newRole);
        setStatusMsg(`Peran simulasi berhasil diubah ke: ${newRole}`);
        onRoleChanged?.(newRole);
        router.refresh();
      } else {
        setStatusMsg(res.error || "Gagal mengubah peran");
      }
    });
  };

  // Khusus Super Admin: Ubah peran pengguna lain di database
  const handleAssignRole = async (targetUserId: string, newRole: "SUPERADMIN" | "ADMIN" | "USER") => {
    setUpdatingUserId(targetUserId);
    setStatusMsg(null);
    try {
      const res = await assignUserRole(targetUserId, newRole);
      if (res.success) {
        setUserList((prev) =>
          prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
        );
        setStatusMsg("Peran pengguna berhasil diperbarui di sistem!");
      } else {
        alert(res.error || "Gagal memperbarui peran pengguna.");
      }
    } catch {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Tampilan Terkunci untuk Siswa Biasa (USER) atau Staf (ADMIN)
  if (!isSuperAdmin) {
    return (
      <div className="border border-fluor/30 bg-night p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-fluor/15 pb-2">
          <div className="flex items-center space-x-2 text-fluor">
            <Shield className="w-5 h-5 text-fluor/60" />
            <span className="font-hud text-lg tracking-widest text-fluor uppercase">
              STATUS PERAN PENGGUNA
            </span>
          </div>
          <Badge variant={activeRole === "ADMIN" ? "cyan" : "outline"}>
            {activeRole === "ADMIN" ? "ADMIN (GURU & STAF)" : "SISWA"}
          </Badge>
        </div>

        <div className="p-3.5 border border-fluor/20 bg-fluor/[0.02] flex items-start space-x-3">
          <Lock className="w-4 h-4 text-caution shrink-0 mt-0.5" />
          <div className="space-y-1 font-body text-xs text-fluor/80 leading-relaxed">
            <p className="font-semibold text-fluor uppercase font-hud tracking-wider">
              PERAN TERKELOLA TERPUSAT
            </p>
            <p>
              Akun Anda terdaftar sebagai{" "}
              <strong className="text-fluor">
                {activeRole === "ADMIN" ? "Admin (Guru / Staf)" : "Siswa (User)"}
              </strong>
              . Sesuai kebijakan SMK TI BAZMA, siswa tidak dapat mengubah perannya sendiri menjadi admin atau super admin. Peran baru hanya dapat dibuat dan ditetapkan oleh Super Admin sekolah.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan Lengkap Khusus Super Admin
  const filteredUsers = userList.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.username && u.username.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Pengujian Simulasi Peran Super Admin */}
      <div className="border border-caution/60 bg-night p-5 space-y-4 shadow-[0_0_15px_rgba(242,194,0,0.1)]">
        <div className="flex items-center justify-between border-b border-fluor/15 pb-2">
          <div className="flex items-center space-x-2 text-fluor">
            <ShieldAlert className="w-5 h-5 text-ok" />
            <span className="font-hud text-lg tracking-widest text-fluor uppercase">
              SIMULASI PERAN AKUN AKTIF [SUPER ADMIN]
            </span>
          </div>
          <Badge variant="ok">SUPER ADMIN AKTIF</Badge>
        </div>

        <p className="font-body text-xs text-fluor/70 leading-relaxed">
          Sebagai Super Admin, Anda dapat menguji tampilan dan sudut pandang antarmuka sebagai Super Admin, Admin Guru, atau Siswa:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {roles.map((r) => {
            const isSelected = activeRole === r.id;
            const Icon = r.icon;

            return (
              <button
                key={r.id}
                type="button"
                disabled={isPending}
                onClick={() => handleSelectRole(r.id)}
                className={`p-3.5 border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "border-caution bg-caution/15 shadow-[0_0_12px_rgba(242,194,0,0.15)]"
                    : "border-fluor/20 bg-fluor/[0.02] hover:border-fluor/60 hover:bg-fluor/[0.05]"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Icon
                      className={`w-4 h-4 ${
                        r.id === "SUPERADMIN"
                          ? "text-ok"
                          : r.id === "ADMIN"
                          ? "text-neon-cyan"
                          : "text-fluor/70"
                      }`}
                    />
                    {isSelected && <Check className="w-4 h-4 text-caution" />}
                  </div>
                  <h4 className="font-sign text-base uppercase tracking-wider text-fluor pt-1">
                    {r.label}
                  </h4>
                  <p className="font-body text-[11px] text-fluor/70 leading-snug">
                    {r.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-fluor/10 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-fluor/50 uppercase">
                    {isSelected ? "[TERPILIH]" : "[UJI PERAN]"}
                  </span>
                  {isSelected && (
                    <Badge variant={r.badgeVariant} className="text-[10px] py-0 px-1.5">
                      AKTIF
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {isPending && (
          <div className="flex items-center space-x-2 font-mono text-xs text-caution">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>MENGUBAH PERAN SISTEM...</span>
          </div>
        )}
      </div>

      {/* 2. Panel Manajemen Peran Seluruh Pengguna Sekolah */}
      <div className="border border-fluor/30 bg-night p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-fluor/15 gap-2">
          <div className="flex items-center space-x-2 text-fluor">
            <Users className="w-5 h-5 text-neon-cyan" />
            <span className="font-hud text-lg tracking-widest text-fluor uppercase">
              PANEL KELOLA PERAN SISWA &amp; GURU (DIREKTORI SEKOLAH)
            </span>
          </div>
          <span className="font-mono text-xs text-fluor/50">
            TOTAL {userList.length} PENGGUNA TERDAFTAR
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-fluor/40" />
          <Input
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Cari nama atau email pengguna untuk mengatur peran..."
            className="pl-9 h-9 text-xs font-mono"
          />
        </div>

        {isLoadingUsers ? (
          <div className="p-6 text-center font-mono text-xs text-fluor/50">
            Memuat daftar pengguna sekolah...
          </div>
        ) : (
          <div className="divide-y divide-fluor/10 border border-fluor/20 max-h-80 overflow-y-auto">
            {filteredUsers.map((u) => {
              const isUpdating = updatingUserId === u.id;
              return (
                <div
                  key={u.id}
                  className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-fluor/[0.02]"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-sign text-base text-fluor uppercase">{u.name}</span>
                      <Badge
                        variant={
                          u.role === "SUPERADMIN" ? "ok" : u.role === "ADMIN" ? "cyan" : "outline"
                        }
                        className="text-[10px]"
                      >
                        {u.role === "SUPERADMIN"
                          ? "SUPER ADMIN"
                          : u.role === "ADMIN"
                          ? "GURU/STAF"
                          : "SISWA"}
                      </Badge>
                    </div>
                    <p className="font-mono text-xs text-fluor/60">
                      {u.email} {u.username && `• @${u.username}`}
                    </p>
                  </div>

                  {/* Tombol Pengubah Peran oleh Super Admin */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    {isUpdating ? (
                      <div className="flex items-center space-x-1.5 font-mono text-xs text-caution">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>MENYIMPAN...</span>
                      </div>
                    ) : (
                      <>
                        {u.role !== "ADMIN" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignRole(u.id, "ADMIN")}
                            className="font-hud text-xs border-neon-cyan/60 text-neon-cyan hover:bg-neon-cyan hover:text-night"
                          >
                            + GURU/STAF
                          </Button>
                        )}
                        {u.role !== "USER" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignRole(u.id, "USER")}
                            className="font-hud text-xs border-fluor/40 text-fluor/70 hover:border-fluor hover:text-fluor"
                          >
                            JADIKAN SISWA
                          </Button>
                        )}
                        {u.role !== "SUPERADMIN" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignRole(u.id, "SUPERADMIN")}
                            className="font-hud text-xs border-ok/60 text-ok hover:bg-ok hover:text-night"
                          >
                            + SUPER ADMIN
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {statusMsg && (
          <div className="p-2.5 border border-ok/40 bg-ok/10 text-ok font-mono text-xs">
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
}
