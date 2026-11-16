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
  | "lab_komputer"
  | "ruang_rapat"
  | "ruang_konsultansi"
  | "ruang_kelas"
  | "perpustakaan"
  | "ruang_musik"
  | "classroom-desk"
  | "classroom-blackboard"
  | "classroom-discussion"
  | "classroom-materials"
  | "classroom-exit"
  | "classroom-teacher";

export type CameraMode = "fps" | "inspect";

export interface HoveredInteractableState {
  id: string;
  type: InteractableType;
  label: string;
  actionLabel: string;
  isLocked?: boolean;
  lockedMessage?: string;
  distance: number;
  source: "refs" | "konseptual";
}

export interface ActivePanelState {
  interactableId: string;
  type: InteractableType;
  title: string;
  description: string;
  details?: string[];
  source: "refs" | "konseptual";
  isLocked?: boolean;
}

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
  eyeHeight: number; // alias untuk cameraHeight
  standingHeight: number;
  crouchingHeight: number;
  maxWalkableSlope: number;
  playerPosition: [number, number, number];
  isPointerLocked: boolean;
  touchControlsActive: boolean;
  webGLSupported: boolean;
  cameraMode: CameraMode;
  cutawayMode: boolean;
  headBobEnabled: boolean;

  // Interaksi & Panel
  activeInteractable: InteractableItem | null;
  hoveredInteractable: HoveredInteractableState | null;
  activePanel: InteractableType | null;
  activePanelState: ActivePanelState | null;
  doorStates: Record<string, boolean>;
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
  setCameraMode: (mode: CameraMode) => void;
  setCutawayMode: (enabled: boolean) => void;
  setHeadBobEnabled: (enabled: boolean) => void;
  toggleDoorState: (doorId: string) => void;

  setActiveInteractable: (item: InteractableItem | null) => void;
  setHoveredInteractable: (target: HoveredInteractableState | null) => void;
  openPanel: (panel: InteractableType | ActivePanelState) => void;
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
  eyeHeight: STANDING_HEIGHT,
  standingHeight: STANDING_HEIGHT,
  crouchingHeight: CROUCHING_HEIGHT,
  maxWalkableSlope: 0.45,
  playerPosition: [0, STANDING_HEIGHT, 38], // spawn di dekat gerbang
  isPointerLocked: false,
  touchControlsActive: false,
  webGLSupported: true,
  cameraMode: "fps",
  cutawayMode: false,
  headBobEnabled: false,

  activeInteractable: null,
  hoveredInteractable: null,
  activePanel: null,
  activePanelState: null,
  doorStates: {},
  showControlHelp: false,
  sessionDuration: 0,

  worldSettings: defaultSettings,

  setPaused: (isPaused) => set({ isPaused }),

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  setCrouching: (isCrouching) =>
    set({
      isCrouching,
      cameraHeight: isCrouching ? CROUCHING_HEIGHT : STANDING_HEIGHT,
      eyeHeight: isCrouching ? CROUCHING_HEIGHT : STANDING_HEIGHT,
    }),

  setRunning: (isRunning) => set({ isRunning }),

  setPlayerPosition: (playerPosition) => set({ playerPosition }),

  setPointerLocked: (isPointerLocked) => set({ isPointerLocked }),

  setTouchControlsActive: (touchControlsActive) => set({ touchControlsActive }),

  setWebGLSupported: (webGLSupported) => set({ webGLSupported }),

  setCameraMode: (cameraMode) => set({ cameraMode }),

  setCutawayMode: (cutawayMode) => set({ cutawayMode }),

  setHeadBobEnabled: (headBobEnabled) => set({ headBobEnabled }),

  toggleDoorState: (doorId: string) =>
    set((state) => ({
      doorStates: {
        ...state.doorStates,
        [doorId]: !state.doorStates[doorId],
      },
    })),

  setActiveInteractable: (activeInteractable) => set({ activeInteractable }),

  setHoveredInteractable: (hoveredInteractable) => set({ hoveredInteractable }),

  openPanel: (panel) => {
    if (typeof panel === "string") {
      set({ activePanel: panel, isPaused: true, isPointerLocked: false });
    } else {
      set({
        activePanelState: panel,
        activePanel: panel.type,
        isPaused: true,
        isPointerLocked: false,
      });
    }
  },

  closePanel: () => set({ activePanel: null, activePanelState: null, isPaused: false }),

  setShowControlHelp: (showControlHelp) => set({ showControlHelp }),

  toggleControlHelp: () =>
    set((state) => ({ showControlHelp: !state.showControlHelp })),

  incrementSessionDuration: () =>
    set((state) => ({ sessionDuration: state.sessionDuration + 1 })),

  updateWorldSettings: (settings) =>
    set((state) => ({
      worldSettings: {
        ...state.worldSettings,
        ...settings,
      },
    })),

  resetWorld: () =>
    set({
      isPaused: false,
      isCrouching: false,
      isRunning: false,
      cameraHeight: STANDING_HEIGHT,
      eyeHeight: STANDING_HEIGHT,
      playerPosition: [0, STANDING_HEIGHT, 38],
      isPointerLocked: false,
      activeInteractable: null,
      hoveredInteractable: null,
      activePanel: null,
      activePanelState: null,
      sessionDuration: 0,
      worldSettings: defaultSettings,
    }),
}));
