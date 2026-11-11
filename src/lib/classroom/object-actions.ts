"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { ensureCosmeticsSeeded } from "@/lib/db/seed-cosmetics";
import type {
  DoorAccessStatus,
  LokerProfileData,
  CerminCatalogData,
} from "@/lib/classroom/types";
import {
  parseDoorStatus,
  formatLokerProfile,
  validateBioInput,
  type RawUserData,
} from "@/lib/classroom/object-utils";

/**
 * Server Action: Mendapatkan sesi aktif
 */
async function getSession() {
  const reqHeaders = await headers();
  return await auth.api.getSession({
    headers: reqHeaders,
  });
}

/**
 * Server Action: Ambil data akses pintu kelas
 */
export async function getPintuKelasAccess(classCode: string = "SIJA-10A"): Promise<DoorAccessStatus> {
  const session = await getSession();
  const userId = session?.user?.id ?? null;

  const targetClass = await prisma.class.findUnique({
    where: { code: classCode },
    include: {
      members: {
        select: {
          userId: true,
          role: true,
          seatIndex: true,
        },
      },
    },
  });

  return parseDoorStatus(userId, targetClass);
}

/**
 * Server Action: Ambil data loker profil siswa
 */
export async function getLokerProfile(): Promise<LokerProfileData> {
  const session = await getSession();
  if (!session?.user?.id) {
    return formatLokerProfile(null);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      memberships: {
        include: {
          class: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
    },
  });

  return formatLokerProfile(user as unknown as RawUserData);
}

/**
 * Server Action: Perbarui bio loker profil
 */
export async function updateLokerBio(rawBio: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Anda belum masuk akun." };
  }

  const validation = validateBioInput(rawBio);
  if (!validation.valid || validation.cleaned === undefined) {
    return { success: false, error: validation.error };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { bio: validation.cleaned },
  });

  return { success: true };
}

/**
 * Server Action: Ambil katalog cermin kosmetik (AvatarFrame & ProfileEffect)
 */
export async function getCerminCosmetics(): Promise<CerminCatalogData> {
  await ensureCosmeticsSeeded();

  const session = await getSession();
  let activeFrameId: string | null = null;
  let activeEffectId: string | null = null;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { activeFrameId: true, activeEffectId: true },
    });
    activeFrameId = user?.activeFrameId ?? null;
    activeEffectId = user?.activeEffectId ?? null;
  }

  const [frames, effects] = await Promise.all([
    prisma.avatarFrame.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        assetUrl: true,
      },
    }),
    prisma.profileEffect.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        configKey: true,
      },
    }),
  ]);

  return {
    frames,
    effects,
    activeFrameId,
    activeEffectId,
  };
}

/**
 * Server Action: Simpan bingkai avatar aktif pengguna dari cermin
 */
export async function updateUserActiveFrame(
  frameId: string | null
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Anda belum masuk akun." };
  }

  // Jika frameId diberikan, pastikan ada di katalog
  if (frameId) {
    const frame = await prisma.avatarFrame.findUnique({
      where: { id: frameId },
    });
    if (!frame) {
      return { success: false, error: "Bingkai katalog tidak valid." };
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { activeFrameId: frameId },
  });

  return { success: true };
}
