export interface PlayerPositionPayload {
  x: number;
  y: number;
  z: number;
  rotY: number;
}

export interface PresenceSummaryResult {
  activeStudentCount: number;
  activeSeatIndices: Set<number>;
}

/**
 * Memeriksa apakah update posisi memenuhi syarat untuk dikirim:
 * 1. Selang waktu sejak update terakhir >= minIntervalMs (100ms untuk batas 10Hz).
 * 2. Perubahan jarak perpindahan atau rotasi melampaui minDelta.
 */
export function shouldSendPositionUpdate(
  prevPos: PlayerPositionPayload | null,
  nextPos: PlayerPositionPayload,
  prevTime: number,
  now: number,
  minIntervalMs: number = 100,
  minDelta: number = 0.01
): boolean {
  if (now - prevTime < minIntervalMs) {
    return false;
  }

  if (!prevPos) {
    return true;
  }

  const dx = nextPos.x - prevPos.x;
  const dy = nextPos.y - prevPos.y;
  const dz = nextPos.z - prevPos.z;
  const dr = Math.abs(nextPos.rotY - prevPos.rotY);

  const distSq = dx * dx + dy * dy + dz * dz;
  return distSq >= minDelta * minDelta || dr >= minDelta;
}

/**
 * Throttler posisi untuk membatasi pengiriman koordinat gerak pemain
 * maksimal 10Hz (interval 100ms) sesuai spesifikasi WORLD.md & AGENTS.md.
 */
export function createPositionThrottler(
  intervalMs: number = 100,
  onSend: (pos: PlayerPositionPayload) => void
) {
  let lastSentTime = 0;
  let lastSentPos: PlayerPositionPayload | null = null;

  return {
    update(nextPos: PlayerPositionPayload, getTime: () => number = () => Date.now()) {
      const now = getTime();
      if (shouldSendPositionUpdate(lastSentPos, nextPos, lastSentTime, now, intervalMs)) {
        lastSentTime = now;
        lastSentPos = { ...nextPos };
        onSend(nextPos);
      }
    },
    reset() {
      lastSentTime = 0;
      lastSentPos = null;
    },
  };
}

/**
 * Menghitung ringkasan status kehadiran kelas:
 * - Menentukan jumlah siswa yang online di kelas
 * - Memetakan nomor meja (seatIndex) mana saja yang lampunya harus menyala
 */
export function calculatePresenceSummary(
  onlineUserIds: Set<string>,
  classMembers: { userId: string; seatIndex: number | null }[]
): PresenceSummaryResult {
  const activeSeatIndices = new Set<number>();
  let activeStudentCount = 0;

  for (const member of classMembers) {
    if (onlineUserIds.has(member.userId)) {
      activeStudentCount++;
      if (member.seatIndex !== null) {
        activeSeatIndices.add(member.seatIndex);
      }
    }
  }

  return {
    activeStudentCount,
    activeSeatIndices,
  };
}

