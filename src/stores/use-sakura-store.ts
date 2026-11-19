import { create } from "zustand";
import { RoomInfo } from "@/lib/world/sakura-campus-layout";

export type CameraMode = "orbit" | "walk";
export type FloorCutaway = "ALL" | "1F" | "2F" | "3F" | "ROOF";
export type FieldMarkingMode = "SOCCER" | "BASEBALL" | "BOTH";
export type TimePreset = "morning" | "noon" | "sunset" | "night";

interface SakuraState {
  cameraMode: CameraMode;
  selectedFloor: FloorCutaway;
  fieldMode: FieldMarkingMode;
  hoveredRoom: RoomInfo | null;
  activeRoomDetail: RoomInfo | null;
  teleportPosition: [number, number, number] | null;
  timePreset: TimePreset;
  timeHour: number;
  showMinimap: boolean;

  setCameraMode: (mode: CameraMode) => void;
  setSelectedFloor: (floor: FloorCutaway) => void;
  setFieldMode: (mode: FieldMarkingMode) => void;
  setHoveredRoom: (room: RoomInfo | null) => void;
  setActiveRoomDetail: (room: RoomInfo | null) => void;
  teleportTo: (pos: [number, number, number]) => void;
  clearTeleport: () => void;
  setTimePreset: (preset: TimePreset) => void;
  setTimeHour: (hour: number) => void;
  toggleMinimap: () => void;
}

export const useSakuraStore = create<SakuraState>((set) => ({
  cameraMode: "orbit",
  selectedFloor: "ALL",
  fieldMode: "BOTH",
  hoveredRoom: null,
  activeRoomDetail: null,
  teleportPosition: null,
  timePreset: "noon",
  timeHour: 13.0,
  showMinimap: true,

  setCameraMode: (mode) => set({ cameraMode: mode }),
  setSelectedFloor: (floor) => set({ selectedFloor: floor }),
  setFieldMode: (mode) => set({ fieldMode: mode }),
  setHoveredRoom: (room) => set({ hoveredRoom: room }),
  setActiveRoomDetail: (room) => set({ activeRoomDetail: room }),
  teleportTo: (pos) => set({ teleportPosition: pos }),
  clearTeleport: () => set({ teleportPosition: null }),
  setTimePreset: (preset) => {
    let hour = 13.0;
    if (preset === "morning") hour = 7.5;
    if (preset === "sunset") hour = 17.5;
    if (preset === "night") hour = 21.0;
    set({ timePreset: preset, timeHour: hour });
  },
  setTimeHour: (hour) => {
    let preset: TimePreset = "noon";
    if (hour >= 6 && hour < 11) preset = "morning";
    else if (hour >= 11 && hour < 16) preset = "noon";
    else if (hour >= 16 && hour < 19) preset = "sunset";
    else preset = "night";
    set({ timeHour: hour, timePreset: preset });
  },
  toggleMinimap: () => set((s) => ({ showMinimap: !s.showMinimap })),
}));
