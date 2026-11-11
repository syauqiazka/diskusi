import { describe, expect, it, beforeEach } from "vitest";
import {
  useWorldStore,
  STANDING_HEIGHT,
  CROUCHING_HEIGHT,
  type InteractableItem,
} from "@/stores/use-world-store";

describe("State Store Dunia 3D (Zustand)", () => {
  beforeEach(() => {
    useWorldStore.getState().resetWorld();
  });

  it("memiliki state awal dengan ketinggian berdiri 1.6m dan tidak dijeda", () => {
    const state = useWorldStore.getState();
    expect(state.cameraHeight).toBe(STANDING_HEIGHT);
    expect(state.isPaused).toBe(false);
    expect(state.isCrouching).toBe(false);
    expect(state.activePanel).toBeNull();
    expect(state.showControlHelp).toBe(false);
    expect(state.sessionDuration).toBe(0);
  });

  it("menurunkan ketinggian kamera ke 0.9m saat jongkok dan mengembalikannya ke 1.6m saat berdiri", () => {
    const { setCrouching } = useWorldStore.getState();

    // Aksi Jongkok
    setCrouching(true);
    let state = useWorldStore.getState();
    expect(state.isCrouching).toBe(true);
    expect(state.cameraHeight).toBe(CROUCHING_HEIGHT);

    // Kembali Berdiri
    setCrouching(false);
    state = useWorldStore.getState();
    expect(state.isCrouching).toBe(false);
    expect(state.cameraHeight).toBe(STANDING_HEIGHT);
  });

  it("mengubah status jeda (isPaused) saat tombol jeda diaktifkan", () => {
    const { togglePause } = useWorldStore.getState();

    togglePause();
    expect(useWorldStore.getState().isPaused).toBe(true);

    togglePause();
    expect(useWorldStore.getState().isPaused).toBe(false);
  });

  it("menjeda kontrol dunia secara otomatis saat panel 2D dibuka, dan melanjutkan saat ditutup", () => {
    const { openPanel, closePanel, setPointerLocked } = useWorldStore.getState();

    setPointerLocked(true);
    expect(useWorldStore.getState().isPointerLocked).toBe(true);

    // Buka panel pintu kelas
    openPanel("door");
    let state = useWorldStore.getState();
    expect(state.activePanel).toBe("door");
    expect(state.isPaused).toBe(true); // Kontrol gerak dijeda
    expect(state.isPointerLocked).toBe(false); // Pointer lock dilepas untuk interaksi panel 2D

    // Tutup panel
    closePanel();
    state = useWorldStore.getState();
    expect(state.activePanel).toBeNull();
    expect(state.isPaused).toBe(false); // Kontrol gerak aktif kembali
  });

  it("dapat memperbarui pengaturan preferensi dunia secara parsial", () => {
    const { updateWorldSettings } = useWorldStore.getState();

    updateWorldSettings({
      graphicsQuality: "high",
      nightMode: false,
    });

    const settings = useWorldStore.getState().worldSettings;
    expect(settings.graphicsQuality).toBe("high");
    expect(settings.nightMode).toBe(false);
    expect(settings.sound).toBe(false); // Nilai lain tetap dipertahankan
  });

  it("dapat melacak objek interaktif 3.2 aktif dan posisi pemain", () => {
    const { setActiveInteractable, setPlayerPosition } = useWorldStore.getState();

    const madingItem: InteractableItem = {
      id: "obj-mading-1",
      type: "mading",
      label: "Mading Sekolah",
      actionPrompt: "[E] BUKA MADING",
      distance: 1.8,
    };

    setActiveInteractable(madingItem);
    expect(useWorldStore.getState().activeInteractable).toEqual(madingItem);

    setPlayerPosition([2, 1.6, -4]);
    expect(useWorldStore.getState().playerPosition).toEqual([2, 1.6, -4]);
  });

  it("dapat mengontrol toggle bantuan kontrol dan durasi sesi", () => {
    const { toggleControlHelp, incrementSessionDuration } = useWorldStore.getState();

    toggleControlHelp();
    expect(useWorldStore.getState().showControlHelp).toBe(true);

    toggleControlHelp();
    expect(useWorldStore.getState().showControlHelp).toBe(false);

    incrementSessionDuration();
    incrementSessionDuration();
    expect(useWorldStore.getState().sessionDuration).toBe(2);
  });
});
