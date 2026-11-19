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
        description: "Akses penuh platform, manajemen peran, konfigurasi kawasan, dan moderasi global.",
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
 * Beralih peran akun aktif untuk kemudahan pengujian dan simulasi hak akses
 */
export async function switchMyRole(newRole: "SUPERADMIN" | "ADMIN" | "USER") {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Harap masuk log terlebih dahulu." };
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

/**
 * Mengubah peran pengguna lain (khusus SUPERADMIN atau ADMIN)
 */
export async function setUserRole(targetUserId: string, newRole: "SUPERADMIN" | "ADMIN" | "USER") {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Harap masuk log terlebih dahulu." };
  }

  // Cek apakah pengguna aktif adalah SUPERADMIN atau ADMIN
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (currentUser?.role !== "SUPERADMIN" && currentUser?.role !== "ADMIN") {
    return { success: false, error: "Hanya SUPER ADMIN atau ADMIN yang berhak mengubah peran." };
  }

  const validRole = PlatformRole[newRole];
  if (!validRole) {
    return { success: false, error: "Peran tidak valid." };
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: validRole },
  });

  return { success: true, role: validRole };
}
