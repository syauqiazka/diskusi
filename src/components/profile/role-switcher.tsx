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
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  switchMyRole,
  getAllUsersForRoleManagement,
  assignUserRole,
  updateManagedUser,
  deleteManagedUser,
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
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editUsername, setEditUsername] = React.useState("");
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);

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
      label: "Super Admin",
      badgeVariant: "ok" as const,
      icon: ShieldAlert,
      desc: "Pengelola Sistem & Hak Akses Tertinggi",
    },
    {
      id: "ADMIN" as const,
      label: "Admin (Guru & Staf)",
      badgeVariant: "peach" as const,
      icon: Shield,
      desc: "Pengajar, Guru & Jajaran Staf Sekolah",
    },
    {
      id: "USER" as const,
      label: "Siswa",
      badgeVariant: "mint" as const,
      icon: User,
      desc: "Akun Pengguna Siswa Sekolah",
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

  const startEditUser = (user: UserManagementItem) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditUsername(user.username || "");
    setStatusMsg(null);
  };

  const handleSaveUser = async (targetUserId: string) => {
    setIsSavingEdit(true);
    setStatusMsg(null);
    try {
      const res = await updateManagedUser(targetUserId, {
        name: editName,
        username: editUsername.trim() || null,
      });
      if (!res.success || !res.user) {
        setStatusMsg(res.error || "Data akun gagal diperbarui.");
        return;
      }
      setUserList((prev) => prev.map((u) =>
        u.id === targetUserId ? { ...u, name: res.user!.name, username: res.user!.username } : u
      ));
      setEditingUserId(null);
      setStatusMsg("Data akun berhasil diperbarui.");
    } catch {
      setStatusMsg("Terjadi kesalahan saat memperbarui akun.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteUser = async (user: UserManagementItem) => {
    const confirmed = window.confirm(
      `Hapus akun ${user.name} (${user.email})? Data yang terhubung seperti postingan, komentar, pesan, dan sesi akun dapat ikut terhapus. Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    setUpdatingUserId(user.id);
    setStatusMsg(null);
    try {
      const res = await deleteManagedUser(user.id);
      if (res.success) {
        setUserList((prev) => prev.filter((u) => u.id !== user.id));
        setStatusMsg(`Akun ${user.email} berhasil dihapus.`);
      } else {
        setStatusMsg(res.error || "Akun gagal dihapus.");
      }
    } catch {
      setStatusMsg("Terjadi kesalahan saat menghapus akun.");
    } finally {
      setUpdatingUserId(null);
    }
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
      <div className="rounded-3xl border-2 border-border bg-surface p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center space-x-2 text-text">
            <Shield className="w-5 h-5 text-accent" />
            <span className="font-display font-bold text-lg text-text">
              Status Peran Pengguna
            </span>
          </div>
          <Badge variant={activeRole === "ADMIN" ? "peach" : "mint"}>
            {activeRole === "ADMIN" ? "Admin (Guru & Staf)" : "Siswa"}
          </Badge>
        </div>

        <div className="p-4 rounded-2xl border-2 border-border bg-canvas/40 flex items-start space-x-3.5">
          <Lock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1 font-body text-xs text-text-muted leading-relaxed">
            <p className="font-display font-bold text-text text-sm">
              Peran Terkelola Terpusat
            </p>
            <p>
              Akun Anda terdaftar sebagai{" "}
              <strong className="text-text font-semibold">
                {activeRole === "ADMIN" ? "Admin (Guru / Staf)" : "Siswa (User)"}
              </strong>
              . Sesuai kebijakan sekolah, akun siswa tidak dapat mengubah perannya sendiri menjadi admin atau super admin. Peran baru hanya dapat dibuat dan ditetapkan oleh Super Admin.
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
      <div className="rounded-3xl border-2 border-border bg-surface p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center space-x-2.5 text-text">
            <div className="w-9 h-9 rounded-2xl bg-secondary/30 flex items-center justify-center text-text">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg text-text">
              Simulasi Peran Akun Aktif (Super Admin)
            </span>
          </div>
          <Badge variant="ok">Super Admin Aktif</Badge>
        </div>

        <p className="font-body text-xs text-text-muted leading-relaxed">
          Sebagai Super Admin, Anda dapat menguji tampilan dan sudut pandang antarmuka sebagai Super Admin, Admin Guru, atau Siswa:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {roles.map((r) => {
            const isSelected = activeRole === r.id;
            const Icon = r.icon;

            return (
              <button
                key={r.id}
                type="button"
                disabled={isPending}
                onClick={() => handleSelectRole(r.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "border-primary bg-primary/15 shadow-sm"
                    : "border-border bg-canvas/30 hover:border-primary/50"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Icon className="w-4 h-4 text-text" />
                    {isSelected && <Check className="w-4 h-4 text-text font-bold" />}
                  </div>
                  <h4 className="font-display font-bold text-base text-text pt-1">
                    {r.label}
                  </h4>
                  <p className="font-body text-xs text-text-muted leading-snug">
                    {r.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="font-display font-semibold text-[11px] text-text-muted">
                    {isSelected ? "Terpilih" : "Uji Peran"}
                  </span>
                  {isSelected && (
                    <Badge variant={r.badgeVariant} className="text-[10px] py-0 px-2">
                      Aktif
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {isPending && (
          <div className="flex items-center space-x-2 font-body text-xs text-text-muted">
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
            <span>Memperbarui simulasi peran sistem...</span>
          </div>
        )}
      </div>

      {/* 2. Panel Manajemen Peran Seluruh Pengguna Sekolah */}
      <div className="rounded-3xl border-2 border-border bg-surface p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/50 gap-2">
          <div className="flex items-center space-x-2.5 text-text">
            <div className="w-9 h-9 rounded-2xl bg-primary/20 flex items-center justify-center text-text">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <span className="font-display font-bold text-lg text-text">
              Kelola Peran Siswa &amp; Guru (Direktori Sekolah)
            </span>
          </div>
          <span className="font-body text-xs text-text-muted">
            Total {userList.length} Pengguna
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-text-muted" />
          <Input
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Cari nama atau email pengguna untuk mengatur peran..."
            className="pl-10 h-10 text-xs rounded-2xl border-2 border-border bg-canvas/40"
          />
        </div>

        {isLoadingUsers ? (
          <div className="p-8 text-center font-body text-xs text-text-muted">
            Memuat daftar pengguna sekolah...
          </div>
        ) : (
          <div className="divide-y divide-border/30 rounded-2xl border-2 border-border max-h-80 overflow-y-auto bg-canvas/20">
            {filteredUsers.map((u) => {
              const isUpdating = updatingUserId === u.id;
              return (
                <div
                  key={u.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface transition-colors"
                >
                  {editingUserId === u.id ? (
                    <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        aria-label="Nama akun"
                        placeholder="Nama lengkap"
                        className="h-9 text-xs rounded-xl"
                        maxLength={50}
                        disabled={isSavingEdit}
                      />
                      <Input
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        aria-label="Username akun"
                        placeholder="Username (opsional)"
                        className="h-9 text-xs rounded-xl"
                        maxLength={20}
                        disabled={isSavingEdit}
                      />
                    </div>
                  ) : (
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-bold text-sm text-text">{u.name}</span>
                        <Badge
                          variant={
                            u.role === "SUPERADMIN" ? "ok" : u.role === "ADMIN" ? "peach" : "mint"
                          }
                          className="text-[10px]"
                        >
                          {u.role === "SUPERADMIN"
                            ? "Super Admin"
                            : u.role === "ADMIN"
                            ? "Guru/Staf"
                            : "Siswa"}
                        </Badge>
                      </div>
                      <p className="font-body text-xs text-text-muted break-all">
                        {u.email} {u.username && `• @${u.username}`}
                      </p>
                    </div>
                  )}

                  {/* Tombol Pengubah Peran oleh Super Admin */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {isUpdating ? (
                      <div className="flex items-center space-x-1.5 font-body text-xs text-text-muted">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                        <span>Menyimpan...</span>
                      </div>
                    ) : (
                      <>
                        {editingUserId === u.id ? (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleSaveUser(u.id)}
                              disabled={isSavingEdit}
                              className="rounded-xl text-xs"
                            >
                              <Save className="w-3.5 h-3.5 mr-1" />
                              Simpan
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingUserId(null)}
                              disabled={isSavingEdit}
                              className="rounded-xl text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditUser(u)}
                              className="rounded-xl text-xs"
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteUser(u)}
                              className="rounded-xl text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Hapus
                            </Button>
                          </>
                        )}
                        {editingUserId !== u.id && u.role !== "ADMIN" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAssignRole(u.id, "ADMIN")}
                            className="rounded-xl text-xs font-display font-semibold"
                          >
                            + Guru/Staf
                          </Button>
                        )}
                        {editingUserId !== u.id && u.role !== "USER" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignRole(u.id, "USER")}
                            className="rounded-xl text-xs font-display font-semibold"
                          >
                            Jadikan Siswa
                          </Button>
                        )}
                        {editingUserId !== u.id && u.role !== "SUPERADMIN" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAssignRole(u.id, "SUPERADMIN")}
                            className="rounded-xl text-xs font-display font-semibold"
                          >
                            + Super Admin
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
          <div className="p-3.5 rounded-2xl border-2 border-ok/30 bg-ok/10 text-ok font-body text-xs font-semibold">
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
}
