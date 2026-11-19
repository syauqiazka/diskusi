"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { PlatformRole } from "@prisma/client";

// Daftar email Super Admin bawaan sistem
export const DEFAULT_SUPERADMIN_EMAILS = [
  "admin@smkbazma.sch.id",
  "muhammad.syauqi1869@smk.belajar.id",
];

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

  if (DEFAULT_SUPERADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    return true;
  }

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
    select: { email: true, role: true },
  });

  const isSuper =
    currentUser?.role === "SUPERADMIN" ||
    DEFAULT_SUPERADMIN_EMAILS.includes(currentUser?.email?.toLowerCase() || "");

  if (!isSuper) {
    return {
      success: false,
      error: "Akses Ditolak: Anda berstatus Siswa (USER). Hanya Super Admin yang berwenang menetapkan atau mengubah peran.",
    };
  }

  const validRole = PlatformRole[newRole];
  if (!validRole) {
    return { success: false, error: "Peran tidak valid." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: validRole },
  });

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

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { email: true },
  });

  if (!targetUser) {
    return { success: false, error: "Pengguna target tidak ditemukan." };
  }

  // Lindungi akun Super Admin bawaan agar tidak terturunkan
  if (
    DEFAULT_SUPERADMIN_EMAILS.includes(targetUser.email.toLowerCase()) &&
    newRole !== "SUPERADMIN"
  ) {
    return {
      success: false,
      error: "Akun Super Admin bawaan sistem tidak dapat diturunkan perannya.",
    };
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
