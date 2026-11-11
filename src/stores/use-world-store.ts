import { create } from "zustand";

export const STANDING_HEIGHT = 1.6;
export const CROUCHING_HEIGHT = 0.9;
export const MAX_INTERACTION_DISTANCE = 2.5;

export type InteractableType =
  | "door"
  | "mading"
  | "library"
  | "locker"
  | "mirror"
  | "classroom-desk"
  | "classroom-blackboard"
  | "classroom-discussion"
  | "classroom-materials"
  | "classroom-exit"
  | "classroom-teacher";

export interface InteractableItem {
  id: string;
  type: InteractableType;
  label: string;
  actionPrompt: string; // Misal: "[E] MASUK KELAS SIJA"
  description?: string;
  distance?: number;
  position?: [number, number, number];
  targetId?: string; // misal classId
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
  playerPosition: [number, number, number];
  isPointerLocked: boolean;
  touchControlsActive: boolean;
  webGLSupported: boolean;

  // Interaksi & Panel
  activeInteractable: InteractableItem | null;
  activePanel: InteractableType | null;
  showControlHelp: boolean;
  sessionDuration: number; // detik

  // Pengaturan Dunia (WORLD.md & DESIGN.md)
  worldSettings: WorldSettings;

  // Actions
  setPaused: (isPaused: boolean) => void;
  togglePause: () => void;
  setCrouching: (isCrouching: boolean) => void;
  setRunning: (isRunning: boolean) => void;
  setPlayerPosition: (position: [number, number, number]) => void;
  setPointerLocked: (locked: boolean) => void;
  setTouchControlsActive: (active: boolean) => void;
  setWebGLSupported: (supported: boolean) => void;
  setActiveInteractable: (item: InteractableItem | null) => void;
  openPanel: (panel: InteractableType) => void;
  closePanel: () => void;
  setShowControlHelp: (show: boolean) => void;
  toggleControlHelp: () => void;
  incrementSessionDuration: () => void;
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
  playerPosition: [0, STANDING_HEIGHT, 5],
  isPointerLocked: false,
  touchControlsActive: false,
  webGLSupported: true,

  activeInteractable: null,
  activePanel: null,
  showControlHelp: false,
  sessionDuration: 0,

  worldSettings: defaultSettings,

  setPaused: (isPaused) => set({ isPaused }),

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  setCrouching: (isCrouching) =>
    set({
      isCrouching,
      cameraHeight: isCrouching ? CROUCHING_HEIGHT : STANDING_HEIGHT,
    }),

  setRunning: (isRunning) => set({ isRunning }),

  setPlayerPosition: (playerPosition) => set({ playerPosition }),

  setPointerLocked: (isPointerLocked) => set({ isPointerLocked }),

  setTouchControlsActive: (touchControlsActive) => set({ touchControlsActive }),

  setWebGLSupported: (webGLSupported) => set({ webGLSupported }),

  setActiveInteractable: (activeInteractable) => set({ activeInteractable }),

  openPanel: (panel) =>
    set({
      activePanel: panel,
      isPaused: true, // Otomatis jeda kontrol saat panel 2D terbuka
      isPointerLocked: false, // Lepas pointer lock agar mouse bebas di panel
    }),

  closePanel: () =>
    set({
      activePanel: null,
      isPaused: false,
    }),

  setShowControlHelp: (showControlHelp) => set({ showControlHelp }),

  toggleControlHelp: () => set((state) => ({ showControlHelp: !state.showControlHelp })),

  incrementSessionDuration: () => set((state) => ({ sessionDuration: state.sessionDuration + 1 })),

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
      playerPosition: [0, STANDING_HEIGHT, 5],
      isPointerLocked: false,
      touchControlsActive: false,
      webGLSupported: true,
      activeInteractable: null,
      activePanel: null,
      showControlHelp: false,
      sessionDuration: 0,
      worldSettings: defaultSettings,
    }),
}));
