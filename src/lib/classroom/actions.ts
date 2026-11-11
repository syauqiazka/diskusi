"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { assignClassMemberWithRetry } from "@/lib/classroom/seat-allocation";
import { ClassRole } from "@prisma/client";

export async function getCurrentSession() {
  const reqHeaders = await headers();
  return await auth.api.getSession({
    headers: reqHeaders,
  });
}

/**
 * Mendapatkan daftar kelas yang diikuti oleh pengguna yang sedang aktif
 */
export async function getMyClasses() {
  const session = await getCurrentSession();
  if (!session?.user) {
    return [];
  }

  const memberships = await prisma.classMember.findMany({
    where: { userId: session.user.id },
    include: {
      class: {
        include: {
          _count: {
            select: { members: true },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return memberships.map((m) => ({
    membershipId: m.id,
    role: m.role,
    seatIndex: m.seatIndex,
    joinedAt: m.joinedAt,
    classId: m.class.id,
    className: m.class.name,
    classCode: m.class.code,
    description: m.class.description,
    roomLayout: m.class.roomLayout,
    memberCount: m.class._count.members,
  }));
}

/**
 * Bergabung ke kelas berdasarkan kode kelas (misal: "SIJA-10A")
 */
export async function joinClassByCode(rawCode: string) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return { success: false, error: "Anda harus masuk terlebih dahulu untuk bergabung ke kelas." };
  }

  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { success: false, error: "Kode kelas wajib diisi." };
  }

  // Cari kelas berdasarkan kode
  let targetClass = await prisma.class.findUnique({
    where: { code },
  });

  // Jika belum ada kelas sama sekali (inisialisasi awal), buat kelas default SIJA-10A
  if (!targetClass && (code === "SIJA-10A" || code === "SIJA10A")) {
    targetClass = await prisma.class.create({
      data: {
        name: "SIJA 10A (Sistem Informasi, Jaringan & Aplikasi)",
        code: "SIJA-10A",
        description: "Kelas praktik kejuruan SIJA SMK TI BAZMA. Lab Jaringan dan Server.",
        roomLayout: "standard-30",
        createdById: session.user.id,
      },
    });
  }

  if (!targetClass) {
    return {
      success: false,
      error: `Kode kelas "${code}" tidak ditemukan. Pastikan kode kelas sudah benar (contoh: SIJA-10A).`,
    };
  }

  // Periksa apakah sudah terdaftar di kelas ini
  const existingMembership = await prisma.classMember.findUnique({
    where: {
      userId_classId: {
        userId: session.user.id,
        classId: targetClass.id,
      },
    },
  });

  if (existingMembership) {
    return {
      success: true,
      classId: targetClass.id,
      seatIndex: existingMembership.seatIndex,
      message: "Anda sudah terdaftar di kelas ini.",
    };
  }

  // Alokasikan nomor meja siswa secara aman dengan auto-retry jika nomor bentrok
  try {
    const newMember = await assignClassMemberWithRetry(
      prisma,
      {
        userId: session.user.id,
        classId: targetClass.id,
        role: ClassRole.STUDENT,
      },
      { maxSeats: 30, maxRetries: 5 }
    );

    return {
      success: true,
      classId: targetClass.id,
      seatIndex: newMember.seatIndex,
      message: `Berhasil bergabung ke ${targetClass.name}. Anda menempati Meja #${(newMember.seatIndex ?? 0) + 1}.`,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Terjadi kesalahan saat mengalokasikan meja.";
    return { success: false, error: errorMsg };
  }
}


/**
 * Mengambil detail kelas dan daftar anggota terverifikasi (hanya untuk anggota kelas)
 */
export async function getClassDetails(classId: string) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return { authorized: false, error: "Harap masuk untuk melihat kelas." };
  }

  // Verifikasi keanggotaan kelas di sisi server
  const myMembership = await prisma.classMember.findUnique({
    where: {
      userId_classId: {
        userId: session.user.id,
        classId,
      },
    },
  });

  if (!myMembership) {
    return {
      authorized: false,
      error: "Akses ditolak: Anda bukan anggota kelas ini. Masukkan kode kelas untuk bergabung.",
    };
  }

  const classroom = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              displayName: true,
              username: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: [{ role: "asc" }, { seatIndex: "asc" }],
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          displayName: true,
        },
      },
    },
  });

  if (!classroom) {
    return { authorized: false, error: "Kelas tidak ditemukan." };
  }

  return {
    authorized: true,
    class: classroom,
    myMembership,
  };
}

/**
 * Memverifikasi apakah dua pengguna berada di kelas yang sama sebelum membuka DM
 */
export async function verifySameClassMembership(targetUserId: string) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return { allowed: false, reason: "Belum terautentikasi." };
  }

  if (session.user.id === targetUserId) {
    return { allowed: false, reason: "Tidak dapat mengirim pesan ke diri sendiri." };
  }

  // Cari apakah ada classId di mana kedua user terdaftar
  const sharedClass = await prisma.classMember.findFirst({
    where: {
      userId: session.user.id,
      class: {
        members: {
          some: {
            userId: targetUserId,
          },
        },
      },
    },
    include: {
      class: {
        select: { id: true, name: true },
      },
    },
  });

  if (!sharedClass) {
    return {
      allowed: false,
      reason:
        "Aturan DM: Anda dan pengguna tujuan tidak berada di kelas yang sama. DM hanya diizinkan antar sesama anggota kelas.",
    };
  }

  return {
    allowed: true,
    sharedClass: sharedClass.class,
  };
}
