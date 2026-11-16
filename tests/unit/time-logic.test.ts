import { describe, it, expect } from "vitest";
import { calculateTimePhaseState } from "@/stores/use-time-of-day-store";
import { calculateCelestialPositions } from "@/components/world/environment/time-of-day-environment";
import { TIME_OF_DAY_CONFIG } from "@/lib/world/time-of-day.config";

describe("calculateTimePhaseState", () => {
  it("harus mengenali fase pagi pada batas awal 05:00", () => {
    const state = calculateTimePhaseState(5.0);
    expect(state.nominalPhase).toBe("pagi");
    expect(state.isTransitioning).toBe(false);
    expect(state.blendFactor).toBe(0);
  });

  it("harus mengenali fase siang pada batas awal 10:00", () => {
    const state = calculateTimePhaseState(10.0);
    expect(state.nominalPhase).toBe("siang");
    expect(state.isTransitioning).toBe(false);
    expect(state.blendFactor).toBe(0);
  });

  it("harus mengenali fase sore pada batas awal 15:30 (15.5)", () => {
    const state = calculateTimePhaseState(15.5);
    expect(state.nominalPhase).toBe("sore");
    expect(state.isTransitioning).toBe(false);
    expect(state.blendFactor).toBe(0);
  });

  it("harus mengenali fase malam pada batas awal 18:30 (18.5)", () => {
    const state = calculateTimePhaseState(18.5);
    expect(state.nominalPhase).toBe("malam");
    expect(state.isTransitioning).toBe(false);
    expect(state.blendFactor).toBe(0);
  });

  it("harus menangani tengah malam dan wrap 24 -> 0 secara konsisten", () => {
    const stateMidnight = calculateTimePhaseState(0.0);
    expect(stateMidnight.nominalPhase).toBe("malam");
    expect(stateMidnight.isTransitioning).toBe(false);

    const state24 = calculateTimePhaseState(24.0);
    expect(state24.nominalPhase).toBe("malam");
    expect(state24.isTransitioning).toBe(false);

    const stateLate = calculateTimePhaseState(23.75);
    expect(stateLate.nominalPhase).toBe("malam");
    expect(stateLate.isTransitioning).toBe(false);

    const stateNegative = calculateTimePhaseState(-1.0); // -1 jam = 23:00
    expect(stateNegative.nominalPhase).toBe("malam");
  });

  it("harus mendeteksi awal dan progres jendela transisi malam ke pagi (04:30 - 05:00)", () => {
    // 04:30: tepat awal jendela transisi
    const startTrans = calculateTimePhaseState(4.5);
    expect(startTrans.isTransitioning).toBe(true);
    expect(startTrans.fromPhase).toBe("malam");
    expect(startTrans.toPhase).toBe("pagi");
    expect(Math.abs(startTrans.blendFactor - 0.0)).toBeLessThan(0.01);

    // 04:45: pertengahan jendela transisi (50%)
    const midTrans = calculateTimePhaseState(4.75);
    expect(midTrans.isTransitioning).toBe(true);
    expect(Math.abs(midTrans.blendFactor - 0.5)).toBeLessThan(0.01);

    // 05:00: akhir jendela transisi, masuk pagi stabil
    const endTrans = calculateTimePhaseState(5.0);
    expect(endTrans.isTransitioning).toBe(false);
    expect(endTrans.nominalPhase).toBe("pagi");
  });

  it("harus mendeteksi awal dan progres jendela transisi sore ke malam (18:00 - 18:30)", () => {
    // 18:00: tepat awal jendela transisi (18.0)
    const startTrans = calculateTimePhaseState(18.0);
    expect(startTrans.isTransitioning).toBe(true);
    expect(startTrans.fromPhase).toBe("sore");
    expect(startTrans.toPhase).toBe("malam");
    expect(Math.abs(startTrans.blendFactor - 0.0)).toBeLessThan(0.01);

    // 18:15: pertengahan jendela transisi (50%)
    const midTrans = calculateTimePhaseState(18.25);
    expect(midTrans.isTransitioning).toBe(true);
    expect(Math.abs(midTrans.blendFactor - 0.5)).toBeLessThan(0.01);

    // 18:30: akhir transisi, masuk malam murni
    const endTrans = calculateTimePhaseState(18.5);
    expect(endTrans.isTransitioning).toBe(false);
    expect(endTrans.nominalPhase).toBe("malam");
  });
});

describe("calculateCelestialPositions", () => {
  const radius = TIME_OF_DAY_CONFIG.celestialOrbitRadius;
  const sunrise = TIME_OF_DAY_CONFIG.sunriseHour; // 05:50
  const sunset = TIME_OF_DAY_CONFIG.sunsetHour; // 17:55

  it("matahari harus berada di bawah horizon sebelum jam terbit (05:00)", () => {
    const celestial = calculateCelestialPositions(5.0, radius, sunrise, sunset);
    expect(celestial.sun[1]).toBeLessThan(0);
    expect(celestial.sunElevation).toBeLessThan(0);
    expect(celestial.moon[1]).toBeGreaterThan(0);
  });

  it("matahari harus berada tepat di horizon saat waktu terbit 05:50", () => {
    const celestial = calculateCelestialPositions(sunrise, radius, sunrise, sunset);
    expect(Math.abs(celestial.sun[1])).toBeLessThan(0.5);
    expect(celestial.sun[0]).toBeGreaterThan(0);
  });

  it("matahari harus berada di atas horizon saat siang hari (12:00)", () => {
    const celestial = calculateCelestialPositions(12.0, radius, sunrise, sunset);
    expect(celestial.sun[1]).toBeGreaterThan(40);
    expect(celestial.sunElevation).toBeGreaterThan(0.5);
    expect(celestial.moon[1]).toBeLessThan(0);
  });

  it("matahari harus berada tepat di horizon saat waktu terbenam 17:55", () => {
    const celestial = calculateCelestialPositions(sunset, radius, sunrise, sunset);
    expect(Math.abs(celestial.sun[1])).toBeLessThan(0.5);
    expect(celestial.sun[0]).toBeLessThan(0);
  });

  it("matahari harus berada jauh di bawah horizon dan bulan di langit pada jam 22:00", () => {
    const celestial = calculateCelestialPositions(22.0, radius, sunrise, sunset);
    expect(celestial.sun[1]).toBeLessThan(-20);
    expect(celestial.moon[1]).toBeGreaterThan(30);
    expect(celestial.moonElevation).toBeGreaterThan(0.3);
  });
});

