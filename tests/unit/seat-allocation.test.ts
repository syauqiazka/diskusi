import { describe, expect, it, vi } from "vitest";
import { ClassRole } from "@prisma/client";
import {
  findNextAvailableSeat,
  determineSeatForRole,
  assignClassMemberWithRetry,
  type ClassMemberDbClient,
} from "@/lib/classroom/seat-allocation";

describe("Aturan Alokasi Meja (seatIndex)", () => {
  it("hanya murid (STUDENT) yang mendapatkan nomor meja; guru dan asisten bernilai null", () => {
    const occupiedSeats = [0, 1, 2];

    const teacherSeat = determineSeatForRole(ClassRole.TEACHER, occupiedSeats, 30);
    expect(teacherSeat).toBeNull();

    const assistantSeat = determineSeatForRole(ClassRole.ASSISTANT, occupiedSeats, 30);
    expect(assistantSeat).toBeNull();

    const studentSeat = determineSeatForRole(ClassRole.STUDENT, occupiedSeats, 30);
    expect(studentSeat).toBe(3);
  });

  it("mencari nomor meja terendah yang masih kosong di antara nomor yang terisi", () => {
    const occupiedSeats = [0, 2, 3, 5];
    const nextSeat = findNextAvailableSeat(occupiedSeats, 30);
    expect(nextSeat).toBe(1);
  });

  it("melempar error jika seluruh meja di ruangan sudah terisi", () => {
    const fullyOccupied = [0, 1, 2, 3];
    expect(() => determineSeatForRole(ClassRole.STUDENT, fullyOccupied, 4)).toThrowError(
      /Kapasitas meja di kelas ini sudah penuh/
    );
  });

  it("mengulang otomatis transaksi ketika terjadi bentrok nomor meja (P2002)", async () => {
    let callCount = 0;
    const mockDb: ClassMemberDbClient = {
      classMember: {
        findMany: vi.fn().mockImplementation(async () => {
          if (callCount === 0) {
            return [{ seatIndex: 0 }];
          }
          // Pada panggilan kedua, simulasikan meja 1 baru saja diambil transaksi lain
          return [{ seatIndex: 0 }, { seatIndex: 1 }];
        }),
        create: vi.fn().mockImplementation(async ({ data }) => {
          callCount++;
          if (callCount === 1) {
            // Simulasi error P2002 bentrok unik
            const err = new Error("Unique constraint failed");
            (err as unknown as { code: string }).code = "P2002";
            throw err;
          }
          return {
            id: "cm_123",
            userId: data.userId,
            classId: data.classId,
            role: data.role,
            seatIndex: data.seatIndex,
          };
        }),
      },
    };

    const result = await assignClassMemberWithRetry(
      mockDb,
      {
        userId: "user_student",
        classId: "class_abc",
        role: ClassRole.STUDENT,
      },
      { maxRetries: 3 }
    );

    expect(callCount).toBe(2);
    expect(result.seatIndex).toBe(2);
    expect(result.role).toBe(ClassRole.STUDENT);
  });
});

