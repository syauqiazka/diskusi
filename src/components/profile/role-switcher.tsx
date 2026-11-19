"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldAlert, User, Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { switchMyRole } from "@/lib/user/role-actions";

interface RoleSwitcherProps {
  currentRole?: string;
  onRoleChanged?: (newRole: "SUPERADMIN" | "ADMIN" | "USER") => void;
}

export function RoleSwitcher({ currentRole = "USER", onRoleChanged }: RoleSwitcherProps) {
  const router = useRouter();
  const [activeRole, setActiveRole] = React.useState<"SUPERADMIN" | "ADMIN" | "USER">(
    (currentRole.toUpperCase() as "SUPERADMIN" | "ADMIN" | "USER") || "USER"
  );
  const [isPending, startTransition] = React.useTransition();
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);

  const roles = [
    {
      id: "SUPERADMIN" as const,
      label: "SUPER ADMIN",
      badgeVariant: "ok" as const,
      icon: ShieldAlert,
      desc: "Pengelola Sistem & Akses Tertinggi",
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

  const handleSelectRole = (newRole: "SUPERADMIN" | "ADMIN" | "USER") => {
    if (newRole === activeRole) return;
    setStatusMsg(null);

    startTransition(async () => {
      const res = await switchMyRole(newRole);
      if (res.success) {
        setActiveRole(newRole);
        setStatusMsg(`Peran berhasil diubah ke: ${newRole}`);
        onRoleChanged?.(newRole);
        router.refresh();
      } else {
        setStatusMsg(res.error || "Gagal mengubah peran");
      }
    });
  };

  return (
    <div className="border border-fluor/30 bg-night p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-fluor/15 pb-2">
        <div className="flex items-center space-x-2 text-fluor">
          <Shield className="w-5 h-5 text-caution" />
          <span className="font-hud text-lg tracking-widest text-fluor uppercase">
            PILIHAN PERAN PENGGUNA (3 HIERARKI)
          </span>
        </div>
        <Badge variant={activeRole === "SUPERADMIN" ? "ok" : activeRole === "ADMIN" ? "cyan" : "outline"}>
          AKTIF: {activeRole}
        </Badge>
      </div>

      <p className="font-body text-xs text-fluor/70 leading-relaxed">
        Pilih salah satu dari 3 peran resmi di bawah ini untuk mensimulasikan hak akses antarmuka, forum, dan moderasi:
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
                  {isSelected ? "[TERPILIH]" : "[KLIK UNTUK AKTIFKAN]"}
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

      {statusMsg && !isPending && (
        <div className="p-2.5 border border-ok/40 bg-ok/10 text-ok font-mono text-xs">
          {statusMsg}
        </div>
      )}
    </div>
  );
}
