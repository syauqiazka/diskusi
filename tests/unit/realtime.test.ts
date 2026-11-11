import { describe, expect, it, vi } from "vitest";
import {
  shouldSendPositionUpdate,
  createPositionThrottler,
  calculatePresenceSummary,
  type PlayerPositionPayload,
} from "@/lib/realtime/throttler";

describe("Logika Real-Time & Throttling Posisi Multiplayer (Tahap 8)", () => {
  describe("shouldSendPositionUpdate (Throttling 10Hz & Distance Threshold)", () => {
    it("menolak update jika waktu yang berlalu kurang dari 100ms (maks 10Hz)", () => {
      const p1: PlayerPositionPayload = { x: 0, y: 1.6, z: 0, rotY: 0 };
      const p2: PlayerPositionPayload = { x: 1, y: 1.6, z: 1, rotY: 0.5 };

      // 50ms sejak update terakhir (< 100ms)
      const shouldSend = shouldSendPositionUpdate(p1, p2, 1000, 1050, 100);
      expect(shouldSend).toBe(false);
    });

    it("menolak update jika posisi dan rotasi tidak berubah signifikan meskipun > 100ms", () => {
      const p1: PlayerPositionPayload = { x: 0, y: 1.6, z: 0, rotY: 0 };
      const p2: PlayerPositionPayload = { x: 0.001, y: 1.6, z: 0.001, rotY: 0.001 };

      // 200ms (> 100ms), namun perubahan posisi sangat kecil
      const shouldSend = shouldSendPositionUpdate(p1, p2, 1000, 1200, 100, 0.01);
      expect(shouldSend).toBe(false);
    });

    it("mengizinkan update jika waktu >= 100ms dan ada perpindahan posisi yang nyata", () => {
      const p1: PlayerPositionPayload = { x: 0, y: 1.6, z: 0, rotY: 0 };
      const p2: PlayerPositionPayload = { x: 0.5, y: 1.6, z: 0.2, rotY: 0.1 };

      // 120ms (> 100ms) dan delta gerak jelas
      const shouldSend = shouldSendPositionUpdate(p1, p2, 1000, 1120, 100, 0.01);
      expect(shouldSend).toBe(true);
    });
  });

  describe("createPositionThrottler", () => {
    it("memanggil callback maksimal 1 kali dalam rentang interval 100ms", () => {
      const sendMock = vi.fn();
      const throttler = createPositionThrottler(100, sendMock);

      let currentTime = 1000;
      const getTime = () => currentTime;

      // Panggilan pertama pada t=1000
      throttler.update({ x: 0, y: 1.6, z: 0, rotY: 0 }, getTime);
      expect(sendMock).toHaveBeenCalledTimes(1);

      // Panggilan berulang pada t=1020, 1040, 1080 (semua < 100ms)
      currentTime = 1020;
      throttler.update({ x: 0.2, y: 1.6, z: 0.1, rotY: 0.1 }, getTime);
      currentTime = 1040;
      throttler.update({ x: 0.4, y: 1.6, z: 0.2, rotY: 0.2 }, getTime);
      currentTime = 1080;
      throttler.update({ x: 0.6, y: 1.6, z: 0.3, rotY: 0.3 }, getTime);

      expect(sendMock).toHaveBeenCalledTimes(1); // Masih 1 kali karena throttled

      // Panggilan pada t=1110 (110ms sejak update terakhir)
      currentTime = 1110;
      throttler.update({ x: 1.0, y: 1.6, z: 0.5, rotY: 0.5 }, getTime);
      expect(sendMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("calculatePresenceSummary", () => {
    it("menghitung jumlah siswa yang sedang online dan memetakan status lampu meja", () => {
      const onlineUserIds = new Set(["user_1", "user_3"]);
      const classMembers = [
        { userId: "user_1", seatIndex: 0 },
        { userId: "user_2", seatIndex: 1 },
        { userId: "user_3", seatIndex: 2 },
        { userId: "user_4", seatIndex: 3 },
      ];

      const summary = calculatePresenceSummary(onlineUserIds, classMembers);
      expect(summary.activeStudentCount).toBe(2);
      expect(summary.activeSeatIndices.has(0)).toBe(true);
      expect(summary.activeSeatIndices.has(1)).toBe(false);
      expect(summary.activeSeatIndices.has(2)).toBe(true);
      expect(summary.activeSeatIndices.has(3)).toBe(false);
    });
  });
});

