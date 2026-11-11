import { ClassRole } from "@prisma/client";

export interface SeatAllocationOptions {
  maxSeats?: number;
  maxRetries?: number;
}

export const DEFAULT_MAX_SEATS = 30;
export const DEFAULT_MAX_RETRIES = 5;

/**
 * Menemukan nomor meja (seatIndex) terendah yang masih tersedia.
 * @param occupiedSeats Daftar nomor meja yang sudah terisi
 * @param maxSeats Kapasitas maksimum meja dalam ruangan
 * @returns Nomor meja terendah yang kosong, atau null jika penuh
 */
export function findNextAvailableSeat(
  occupiedSeats: (number | null | undefined)[],
  maxSeats: number = DEFAULT_MAX_SEATS
): number | null {
  const occupied = new Set(
    occupiedSeats.filter((s): s is number => typeof s === "number" && s !== null)
  );

  for (let i = 0; i < maxSeats; i++) {
    if (!occupied.has(i)) {
      return i;
    }
  }

  return null;
}

/**
 * Menentukan nomor meja berdasarkan peran kelas.
 * Hanya murid (STUDENT) yang mendapatkan meja. Guru dan asisten mendapatkan null.
 */
export function determineSeatForRole(
  role: ClassRole,
  occupiedSeats: (number | null | undefined)[],
  maxSeats: number = DEFAULT_MAX_SEATS
): number | null {
  if (role !== ClassRole.STUDENT) {
    return null;
  }

  const seat = findNextAvailableSeat(occupiedSeats, maxSeats);
  if (seat === null) {
    throw new Error("Kapasitas meja di kelas ini sudah penuh");
  }

  return seat;
}

/**
 * Antarmuka Prisma Client minimal untuk transaksi keanggotaan kelas
 */
export interface ClassMemberDbClient {
  classMember: {
    findMany: (args: {
      where: { classId: string; seatIndex?: { not: null } };
      select: { seatIndex: true };
    }) => Promise<{ seatIndex: number | null }[]>;
    create: (args: {
      data: {
        userId: string;
        classId: string;
        role: ClassRole;
        seatIndex: number | null;
      };
    }) => Promise<{
      id: string;
      userId: string;
      classId: string;
      role: ClassRole;
      seatIndex: number | null;
    }>;
  };
}

/**
 * Menetapkan anggota ke kelas dengan penanganan tabrakan seatIndex secara otomatis.
 */
export async function assignClassMemberWithRetry(
  db: ClassMemberDbClient,
  params: {
    userId: string;
    classId: string;
    role: ClassRole;
  },
  options: SeatAllocationOptions = {}
) {
  const { maxSeats = DEFAULT_MAX_SEATS, maxRetries = DEFAULT_MAX_RETRIES } = options;

  // Jika bukan murid, guru/asisten tidak butuh nomor meja
  if (params.role !== ClassRole.STUDENT) {
    return await db.classMember.create({
      data: {
        userId: params.userId,
        classId: params.classId,
        role: params.role,
        seatIndex: null,
      },
    });
  }

  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    const currentMembers = await db.classMember.findMany({
      where: {
        classId: params.classId,
        seatIndex: { not: null },
      },
      select: { seatIndex: true },
    });

    const occupiedSeats = currentMembers.map((m) => m.seatIndex);
    const assignedSeat = determineSeatForRole(params.role, occupiedSeats, maxSeats);

    try {
      return await db.classMember.create({
        data: {
          userId: params.userId,
          classId: params.classId,
          role: params.role,
          seatIndex: assignedSeat,
        },
      });
    } catch (error: unknown) {
      // Prisma error P2002 adalah unique constraint violation (bentrok nomor meja)
      const isUniqueConstraintError =
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code: string }).code === "P2002";

      if (isUniqueConstraintError && attempt < maxRetries) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Gagal mengalokasikan meja setelah beberapa kali percobaan");
}

