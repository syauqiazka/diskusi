import { create } from "zustand";

export const STANDING_HEIGHT = 1.6;
export const CROUCHING_HEIGHT = 0.9;
export const MAX_INTERACTION_DISTANCE = 2.5;

export type InteractableType = "door" | "mading" | "library" | "locker" | "mirror";

export interface InteractableItem {
  id: string;
  type: InteractableType;
  label: string;
  actionPrompt: string; // Misal: "[E] MASUK KELAS"
  distance?: number;
}

export interface WorldSettings {
  fastMode: boolean;
  nightMode: boolean;
  sound: boolean;
  showHud: boolean;
  graphicsQuality: "low" | "medium" | "high";
}

export interface WorldState {
  // Status Kontrol Pemain
  isPaused: boolean;
  isCrouching: boolean;
  isRunning: boolean;
  cameraHeight: number;

  // Interaksi & Panel
  activeInteractable: InteractableItem | null;
  activePanel: InteractableType | null;

  // Pengaturan Dunia (WORLD.md & DESIGN.md)
  worldSettings: WorldSettings;

  // Actions
  setPaused: (isPaused: boolean) => void;
  togglePause: () => void;
  setCrouching: (isCrouching: boolean) => void;
  setRunning: (isRunning: boolean) => void;
  setActiveInteractable: (item: InteractableItem | null) => void;
  openPanel: (panel: InteractableType) => void;
  closePanel: () => void;
  updateWorldSettings: (settings: Partial<WorldSettings>) => void;
  resetWorld: () => void;
}

const defaultSettings: WorldSettings = {
  fastMode: false,
  nightMode: true,
  sound: false,
  showHud: true,
  graphicsQuality: "medium",
};

export const useWorldStore = create<WorldState>((set) => ({
  isPaused: false,
  isCrouching: false,
  isRunning: false,
  cameraHeight: STANDING_HEIGHT,

  activeInteractable: null,
  activePanel: null,

  worldSettings: defaultSettings,

  setPaused: (isPaused) => set({ isPaused }),

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  setCrouching: (isCrouching) =>
    set({
      isCrouching,
      cameraHeight: isCrouching ? CROUCHING_HEIGHT : STANDING_HEIGHT,
    }),

  setRunning: (isRunning) => set({ isRunning }),

  setActiveInteractable: (activeInteractable) => set({ activeInteractable }),

  openPanel: (panel) =>
    set({
      activePanel: panel,
      isPaused: true, // Otomatis jeda kontrol saat panel 2D terbuka
    }),

  closePanel: () =>
    set({
      activePanel: null,
      isPaused: false,
    }),

  updateWorldSettings: (newSettings) =>
    set((state) => ({
      worldSettings: {
        ...state.worldSettings,
        ...newSettings,
      },
    })),

  resetWorld: () =>
    set({
      isPaused: false,
      isCrouching: false,
      isRunning: false,
      cameraHeight: STANDING_HEIGHT,
      activeInteractable: null,
      activePanel: null,
      worldSettings: defaultSettings,
    }),
}));
