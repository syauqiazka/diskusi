"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { PlatformRole } from "@prisma/client";

async function getSession() {
  const reqHeaders = await headers();
  return await auth.api.getSession({
    headers: reqHeaders,
  });
}

/**
 * Format label dan varian badge untuk 3 role resmi platform:
 * 1. SUPERADMIN -> SUPER ADMIN (Pengelola Utama Sistem)
 * 2. ADMIN -> ADMIN (GURU & STAF)
 * 3. USER -> SISWA
 */
export async function getRoleDisplay(role?: string | null) {
  const r = (role || "USER").toUpperCase();
  switch (r) {
    case "SUPERADMIN":
      return {
        role: "SUPERADMIN",
        label: "SUPER ADMIN",
        badgeVariant: "ok" as const,
        description: "Akses penuh platform, manajemen peran guru/siswa, konfigurasi kawasan, dan moderasi global.",
      };
    case "ADMIN":
      return {
        role: "ADMIN",
        label: "ADMIN (GURU & STAF)",
        badgeVariant: "cyan" as const,
        description: "Pengajar & jajaran staf SMK TI BAZMA: kelola materi kelas, buat pengumuman, dan moderasi.",
      };
    case "USER":
    default:
      return {
        role: "USER",
        label: "SISWA",
        badgeVariant: "outline" as const,
        description: "Siswa SMK TI BAZMA: akses kelas 2D, jelajah dunia 3D, chat sekelas, dan forum diskusi.",
      };
  }
}

/**
 * Memeriksa apakah pengguna aktif berstatus Super Admin
 */
export async function checkIsSuperAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return user?.role === "SUPERADMIN";
}

/**
 * Beralih peran akun aktif (HANYA diizinkan untuk Super Admin untuk simulasi)
 * Siswa biasa (USER) ditolak keras sesuai aturan sekolah.
 */
export async function switchMyRole(newRole: "SUPERADMIN" | "ADMIN" | "USER") {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Harap masuk log terlebih dahulu." };
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (currentUser?.role !== "SUPERADMIN") {
    return {
      success: false,
      error: "Akses Ditolak: Anda berstatus Siswa (USER). Hanya Super Admin yang berwenang menetapkan atau mengubah peran.",
    };
  }

  const validRole = PlatformRole[newRole];
  if (!validRole) {
    return { success: false, error: "Peran tidak valid." };
  }

  // Peralihan ini hanya untuk simulasi UI. Jangan ubah role permanen
  // akun Super Admin ketika mencoba tampilan role lain.
  return { success: true, role: validRole };
}

export interface UserManagementItem {
  id: string;
  name: string;
  email: string;
  username: string | null;
  role: string;
  createdAt: string;
}

/**
 * Mengambil seluruh daftar pengguna sekolah untuk panel manajemen peran Super Admin
 */
export async function getAllUsersForRoleManagement(): Promise<{
  success: boolean;
  users?: UserManagementItem[];
  error?: string;
}> {
  const isSuper = await checkIsSuperAdmin();
  if (!isSuper) {
    return {
      success: false,
      error: "Hanya Super Admin yang berhak mengakses direktori manajemen peran.",
    };
  }

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  return {
    success: true,
    users: users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })),
  };
}

/**
 * Mengubah peran pengguna lain (Eksklusif dibuat dan diatur oleh Super Admin)
 */
export async function assignUserRole(
  targetUserId: string,
  newRole: "SUPERADMIN" | "ADMIN" | "USER"
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Harap masuk log terlebih dahulu." };
  }

  const isSuper = await checkIsSuperAdmin();
  if (!isSuper) {
    return {
      success: false,
      error: "Akses Ditolak: Hanya Super Admin yang berhak menetapkan peran guru/siswa.",
    };
  }

  if (targetUserId === session.user.id) {
    return {
      success: false,
      error: "Role akun yang sedang digunakan tidak dapat diubah dari panel ini.",
    };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { role: true },
  });

  if (!targetUser) {
    return { success: false, error: "Pengguna target tidak ditemukan." };
  }

  if (targetUser.role === "SUPERADMIN" && newRole !== "SUPERADMIN") {
    const superAdminCount = await prisma.user.count({
      where: { role: "SUPERADMIN" },
    });

    if (superAdminCount <= 1) {
      return {
        success: false,
        error: "Role Super Admin terakhir tidak dapat diturunkan.",
      };
    }
  }

  const validRole = PlatformRole[newRole];
  if (!validRole) {
    return { success: false, error: "Peran tidak valid." };
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: validRole },
  });

  return { success: true };
}


export async function updateManagedUser(
  targetUserId: string,
  input: { name: string; username: string | null }
): Promise<{ success: boolean; error?: string; user?: { name: string; username: string | null } }> {
  const session = await getSession();
  if (!session?.user?.id || !(await checkIsSuperAdmin())) {
    return { success: false, error: "Hanya Super Admin yang dapat mengubah data akun." };
  }

  if (!targetUserId || targetUserId === session.user.id) {
    return { success: false, error: "Akun yang sedang digunakan tidak dapat diedit dari panel ini." };
  }

  const name = input.name.trim();
  const username = input.username?.trim().toLowerCase() || null;
  if (name.length < 2 || name.length > 50) {
    return { success: false, error: "Nama harus terdiri dari 2–50 karakter." };
  }
  if (username && (username.length < 3 || username.length > 20 || !/^[a-z0-9_]+$/.test(username))) {
    return { success: false, error: "Username harus 3–20 karakter dan hanya boleh berisi huruf, angka, atau underscore." };
  }

  try {
    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: { name, username },
      select: { name: true, username: true },
    });
    return { success: true, user };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return { success: false, error: "Username tersebut sudah digunakan akun lain." };
    }
    return { success: false, error: "Data akun gagal diperbarui. Coba lagi." };
  }
}

export async function deleteManagedUser(
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id || !(await checkIsSuperAdmin())) {
    return { success: false, error: "Hanya Super Admin yang dapat menghapus akun." };
  }

  if (!targetUserId || targetUserId === session.user.id) {
    return { success: false, error: "Akun yang sedang digunakan tidak dapat dihapus dari panel ini." };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id: targetUserId },
        select: { role: true, _count: { select: { createdClasses: true } } },
      });

      if (!target) return { success: false, error: "Pengguna target tidak ditemukan." };

      if (target.role === "SUPERADMIN") {
        const superAdminCount = await tx.user.count({ where: { role: "SUPERADMIN" } });
        if (superAdminCount <= 1) {
          return { success: false, error: "Super Admin terakhir tidak dapat dihapus." };
        }
      }

      if (target._count.createdClasses > 0) {
        return {
          success: false,
          error: "Akun ini masih menjadi pembuat kelas. Pindahkan kepemilikan kelas terlebih dahulu sebelum menghapus akun.",
        };
      }

      // Relasi dengan session, account, postingan, komentar, keanggotaan,
      // percakapan, dan pesan mengikuti kebijakan onDelete pada schema Prisma.
      await tx.user.delete({ where: { id: targetUserId } });
      return { success: true };
    });
  } catch {
    return { success: false, error: "Akun tidak dapat dihapus karena masih memiliki data terkait. Periksa relasi database terlebih dahulu." };
  }
}
