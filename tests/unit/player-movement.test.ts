import { describe, it, expect } from "vitest";
import {
  WALK_SPEED,
  PLAYER_RADIUS,
  JUMP_VELOCITY,
  STANDING_BODY_HEIGHT,
  computeDesiredDirection,
  stepVelocity,
  resolveCircleAABBCollisions,
  resolveSlopeStep,
  smoothValue,
  clampPitch,
  MIN_PITCH_RAD,
  MAX_PITCH_RAD,
  getWalkableHeight,
  stepVerticalPhysics,
} from "@/lib/world/movement";
import {
  SCHOOL_FLOOR_SLABS,
  SCHOOL_ROOF_CEILING_SLABS,
  SCHOOL_STAIR_RAMPS,
  SCHOOL_LT1_Y,
  SCHOOL_LT2_Y,
  SCHOOL_LT3_Y,
} from "@/lib/world/school-interior-layout";
import {
  MAX_INTERACT_DISTANCE,
  selectBestInteractionTarget,
} from "@/lib/world/selection";
import { CAMPUS_LAYOUT } from "@/lib/world/campus-layout";
import { getTerrainHeight } from "@/lib/world/terrain";
import { useWorldStore } from "@/stores/use-world-store";

describe("SMK TI BAZMA - First-Person Player & Interaction System", () => {
  it("gerak diagonal ternormalisasi sehingga kecepatannya tidak lebih cepat dari gerak lurus", () => {
    const straight = computeDesiredDirection(
      { forward: true, backward: false, left: false, right: false },
      0.4
    );
    const diagonal = computeDesiredDirection(
      { forward: true, backward: false, left: false, right: true },
      0.4
    );

    const straightLen = Math.hypot(straight.x, straight.z);
    const diagonalLen = Math.hypot(diagonal.x, diagonal.z);

    expect(Math.abs(straightLen - 1)).toBeLessThan(1e-6);
    expect(Math.abs(diagonalLen - 1)).toBeLessThan(1e-6);

    // Simulasi akselerasi sampai steady state
    let vxS = 0;
    let vzS = 0;
    let vxD = 0;
    let vzD = 0;
    for (let i = 0; i < 120; i++) {
      const s = stepVelocity(vxS, vzS, straight.x, straight.z, WALK_SPEED, 1 / 60);
      vxS = s.vx;
      vzS = s.vz;
      const d = stepVelocity(vxD, vzD, diagonal.x, diagonal.z, WALK_SPEED, 1 / 60);
      vxD = d.vx;
      vzD = d.vz;
    }

    const speedStraight = Math.hypot(vxS, vzS);
    const speedDiagonal = Math.hypot(vxD, vzD);
    expect(Math.abs(speedStraight - speedDiagonal)).toBeLessThan(1e-3);
  });

  it("pitch kamera dibatasi antara -85 sampai +85 derajat", () => {
    expect(clampPitch(-Math.PI)).toBe(MIN_PITCH_RAD);
    expect(clampPitch(Math.PI)).toBe(MAX_PITCH_RAD);
    expect(clampPitch(0.25)).toBe(0.25);
  });

  it("tabrakan lingkaran-AABB menahan pemain dari tembus bangunan dan memungkinkan wall slide", () => {
    const lobbyCol = CAMPUS_LAYOUT.colliders.find((c) => c.id === "col_lobby_asrama");
    expect(lobbyCol).toBeDefined();

    // Pemain mencoba masuk sisi timur lobby (maxX = -5.5), bergerak miring ke barat-utara
    const attemptX = lobbyCol!.maxX + 0.1; // Terlalu dekat (jarak 0.1 < PLAYER_RADIUS 0.42)
    const attemptZ = 7.2;

    const resolved = resolveCircleAABBCollisions(
      attemptX,
      attemptZ,
      PLAYER_RADIUS,
      CAMPUS_LAYOUT.colliders,
      CAMPUS_LAYOUT.worldBounds
    );

    expect(resolved.x).toBeGreaterThanOrEqual(lobbyCol!.maxX + PLAYER_RADIUS - 1e-5);
    expect(resolved.z).toBe(attemptZ);

    // Batas luar kawasan juga menahan pemain
    const clampedOut = resolveCircleAABBCollisions(
      999,
      -999,
      PLAYER_RADIUS,
      CAMPUS_LAYOUT.colliders,
      CAMPUS_LAYOUT.worldBounds
    );
    expect(clampedOut.x).toBeLessThanOrEqual(CAMPUS_LAYOUT.worldBounds.maxX - PLAYER_RADIUS + 1e-6);
    expect(clampedOut.z).toBeGreaterThanOrEqual(CAMPUS_LAYOUT.worldBounds.minZ + PLAYER_RADIUS - 1e-6);
  });

  it("batas kemiringan maxWalkableSlope menahan tanjakan curam tetapi meloloskan lereng landai dan tangga", () => {
    const steepTerrain = (x: number, _z: number) => (x > 0 ? x * 1.2 : 0);
    // Mencoba naik dari x=-0.1 ke x=0.5 (deltaX=0.6, rise=0.6 -> slope=1.0 > 0.45)
    const blocked = resolveSlopeStep(
      -0.1,
      0,
      0.5,
      0,
      0.45,
      [],
      steepTerrain
    );
    expect(blocked.blocked).toBe(true);
    expect(blocked.x).toBe(-0.1);

    // Lereng landai (slope 0.2 <= 0.45)
    const gentleTerrain = (x: number, _z: number) => (x > 0 ? x * 0.2 : 0);
    const allowed = resolveSlopeStep(
      0,
      0,
      0.5,
      0,
      0.45,
      [],
      gentleTerrain
    );
    expect(allowed.blocked).toBe(false);
    expect(allowed.x).toBe(0.5);
  });

  it("pemilihan target interaksi hanya menerima objek terdekat dalam jarak <= 2.5m", () => {
    const tooFar = selectBestInteractionTarget([
      { id: "mading_utama", distance: 2.8 },
    ]);
    expect(tooFar).toBeNull();

    const picked = selectBestInteractionTarget([
      { id: "library_kiosk", distance: 2.3 },
      { id: "mading_utama", distance: 1.2 },
      { id: "locker_asrama", distance: 2.9 },
    ]);
    expect(picked).not.toBeNull();
    expect(picked!.id).toBe("mading_utama");
    expect(MAX_INTERACT_DISTANCE).toBe(2.5);
  });

  it("useWorldStore mengelola transisi jongkok, jeda, dan panel interaksi", () => {
    const initial = useWorldStore.getState();
    expect(initial.cameraMode).toBe("fps");
    expect(initial.headBobEnabled).toBe(false);

    // Transisi jongkok (eyeHeight 1.6 <-> 0.9)
    initial.setCrouching(true);
    expect(useWorldStore.getState().isCrouching).toBe(true);
    expect(useWorldStore.getState().eyeHeight).toBe(0.9);

    // Simulasi interpolasi halus tinggi mata
    let smoothEye = 1.6;
    for (let i = 0; i < 60; i++) {
      smoothEye = smoothValue(smoothEye, useWorldStore.getState().eyeHeight, 12.0, 1 / 60);
    }
    expect(Math.abs(smoothEye - 0.9)).toBeLessThan(0.01);

    initial.setCrouching(false);
    expect(useWorldStore.getState().eyeHeight).toBe(1.6);

    // Jeda & Panel 2D
    initial.setPaused(true);
    expect(useWorldStore.getState().isPaused).toBe(true);

    initial.openPanel({
      interactableId: "mading_utama",
      type: "mading",
      title: "MADING KAMPUS",
      description: "Papan info konseptual",
      source: "konseptual",
    });
    expect(useWorldStore.getState().activePanelState?.interactableId).toBe("mading_utama");

    initial.closePanel();
    expect(useWorldStore.getState().activePanelState).toBeNull();
  });

  it("koordinat Y spawn dan seluruh penanda interaksi dihitung dari getTerrainHeight dan bertanda konseptual", () => {
    const spawn = CAMPUS_LAYOUT.playerSpawn;
    expect(spawn.source).toBe("konseptual");
    expect(spawn.position[1]).toBe(
      getTerrainHeight(spawn.position[0], spawn.position[2])
    );

    expect(CAMPUS_LAYOUT.buildings.masjid.source).toBe("konseptual");
    expect(CAMPUS_LAYOUT.interactables.length).toBeGreaterThanOrEqual(5);

    const seenTypes = new Set<string>();
    CAMPUS_LAYOUT.interactables.forEach((item) => {
      seenTypes.add(item.type);
      expect(item.source).toBe("konseptual");
      expect(item.position[1]).toBe(
        getTerrainHeight(item.position[0], item.position[2])
      );
    });

    expect(Array.from(seenTypes).sort()).toEqual([
      "door",
      "library",
      "locker",
      "mading",
      "mirror",
    ]);
  });

  it("fisika vertikal lompatan, gravitasi, pendaratan, dan benturan langit-langit bekerja akurat", () => {
    // 1. Lompatan ruang terbuka di LT 1 (-9.0m) dengan plafon LT 2 di -5.8m (tinggi bersih 3.2m)
    let footY: number = SCHOOL_LT1_Y;
    let vy = JUMP_VELOCITY;
    let peakY = footY;
    for (let i = 0; i < 90; i++) {
      const res = stepVerticalPhysics({
        footY,
        verticalVelocity: vy,
        supportY: SCHOOL_LT1_Y,
        ceilingY: SCHOOL_LT2_Y - 0.2,
        bodyHeight: STANDING_BODY_HEIGHT,
        delta: 1 / 60,
      });
      footY = res.footY;
      vy = res.verticalVelocity;
      peakY = Math.max(peakY, footY);
    }

    expect(peakY).toBeGreaterThan(SCHOOL_LT1_Y + 0.5);
    expect(Math.abs(footY - SCHOOL_LT1_Y)).toBeLessThan(1e-4);

    // 2. Simulasi ruangan langit-langit rendah (plafon hanya +2.0m dari lantai)
    const lowCeil = stepVerticalPhysics({
      footY: SCHOOL_LT1_Y + 0.15,
      verticalVelocity: JUMP_VELOCITY,
      supportY: SCHOOL_LT1_Y,
      ceilingY: SCHOOL_LT1_Y + 2.0,
      bodyHeight: STANDING_BODY_HEIGHT,
      delta: 1 / 30,
    });
    expect(lowCeil.hitCeiling).toBe(true);
    expect(lowCeil.footY + STANDING_BODY_HEIGHT).toBeLessThanOrEqual(SCHOOL_LT1_Y + 2.0 + 1e-6);
  });

  it("getWalkableHeight dan tabrakan 3D mendukung 3 lantai sekolah (LT 1-3) serta tangga U", () => {
    // Pemain di LT 2 tepat di atas sekat LT 1 (X=17.5, Z=-31.0, Y=-5.6m) tidak boleh tertahan dinding LT 1
    const lt2Walk = resolveCircleAABBCollisions(
      17.5,
      -31.0,
      PLAYER_RADIUS,
      CAMPUS_LAYOUT.colliders,
      CAMPUS_LAYOUT.worldBounds,
      SCHOOL_LT2_Y,
      STANDING_BODY_HEIGHT
    );
    expect(lt2Walk.x).toBe(17.5);

    // Pemain di LT 1 tepat di dekat sekat LT 1 (X=17.5, Z=-31.0, Y=-9.0m) WAJIB tertahan sekat LT 1
    const lt1Walk = resolveCircleAABBCollisions(
      17.35,
      -31.0,
      PLAYER_RADIUS,
      CAMPUS_LAYOUT.colliders,
      CAMPUS_LAYOUT.worldBounds,
      SCHOOL_LT1_Y,
      STANDING_BODY_HEIGHT
    );
    expect(lt1Walk.x).toBeLessThan(17.35);

    // Verifikasi permukaan tangga U di tengah segmen bawah LT1 -> LT2 (X=30.5, Z=-23.4)
    const stairMid = getWalkableHeight(
      30.5,
      -23.4,
      SCHOOL_LT1_Y + 0.85,
      CAMPUS_LAYOUT.landscapeStairs,
      SCHOOL_FLOOR_SLABS,
      SCHOOL_STAIR_RAMPS,
      SCHOOL_ROOF_CEILING_SLABS,
      getTerrainHeight
    );
    expect(stairMid.onStair).toBe(true);
    expect(Math.abs(stairMid.y - (SCHOOL_LT1_Y + 0.85))).toBeLessThan(0.05);

    // Verifikasi pelat LT 3 terdeteksi saat pemain berdiri di LT 3 (-2.2m)
    const lt3Surface = getWalkableHeight(
      14.0,
      -30.0,
      SCHOOL_LT3_Y,
      CAMPUS_LAYOUT.landscapeStairs,
      SCHOOL_FLOOR_SLABS,
      SCHOOL_STAIR_RAMPS,
      SCHOOL_ROOF_CEILING_SLABS,
      getTerrainHeight
    );
    expect(lt3Surface.y).toBe(SCHOOL_LT3_Y);
  });

  it("tabrakan furnitur 3D memisahkan lantai LT 1 dan LT 2 tanpa saling mengganggu", () => {
    // Meja Rapat berada di [10.2..15.3, -32.85..-30.55] pada LT 1 (-9.0m)
    const lt1Hit = resolveCircleAABBCollisions(
      12.75,
      -30.2,
      PLAYER_RADIUS,
      CAMPUS_LAYOUT.colliders,
      CAMPUS_LAYOUT.worldBounds,
      SCHOOL_LT1_Y,
      STANDING_BODY_HEIGHT
    );
    expect(lt1Hit.z).toBeGreaterThanOrEqual(-30.55 + PLAYER_RADIUS - 1e-4);

    // Tepat di koordinat X=17.8, Z=-31.5 pada LT 2 (-5.6m) adalah lorong terbuka Lab Komputer
    const lt2Aisle = resolveCircleAABBCollisions(
      17.8,
      -31.5,
      PLAYER_RADIUS,
      CAMPUS_LAYOUT.colliders,
      CAMPUS_LAYOUT.worldBounds,
      SCHOOL_LT2_Y,
      STANDING_BODY_HEIGHT
    );
    expect(lt2Aisle.z).toBe(-31.5);

    // Sedangkan meja PC bank barat LT 2 (Z=-33.2) menahan pemain LT 2
    const lt2BenchHit = resolveCircleAABBCollisions(
      13.8,
      -32.1,
      PLAYER_RADIUS,
      CAMPUS_LAYOUT.colliders,
      CAMPUS_LAYOUT.worldBounds,
      SCHOOL_LT2_Y,
      STANDING_BODY_HEIGHT
    );
    expect(lt2BenchHit.z).toBeGreaterThan(-32.1);
  });
});
