import { create } from "zustand";
import { RoomScheduleItem } from "@/data/campus";

export type CameraMode = "orbit" | "walk" | "topdown";
export type FloorCutaway = "ALL" | "1F" | "2F" | "3F" | "ROOF";
export type FieldMarkingMode = "SOCCER" | "BASEBALL" | "BOTH";
export type TimePreset = "morning" | "noon" | "sunset" | "night";

interface SakuraState {
  cameraMode: CameraMode;
  selectedFloor: FloorCutaway;
  fieldMode: FieldMarkingMode;
  hoveredRoom: RoomScheduleItem | null;
  activeRoomDetail: RoomScheduleItem | null;
  teleportPosition: [number, number, number] | null;
  timePreset: TimePreset;
  timeHour: number;
  showMinimap: boolean;

  setCameraMode: (mode: CameraMode) => void;
  setSelectedFloor: (floor: FloorCutaway) => void;
  setFieldMode: (mode: FieldMarkingMode) => void;
  setHoveredRoom: (room: RoomScheduleItem | null) => void;
  setActiveRoomDetail: (room: RoomScheduleItem | null) => void;
  teleportTo: (pos: [number, number, number]) => void;
  clearTeleport: () => void;
  setTimePreset: (preset: TimePreset) => void;
  setTimeHour: (hour: number) => void;
  toggleMinimap: () => void;
}

const getInitialCameraMode = (): CameraMode => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "topdown") return "topdown";
    if (params.get("mode") === "orbit") return "orbit";
  }
  return "walk";
};

const getInitialTeleport = (): [number, number, number] => {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const tp = params.get("tp");
    // (a) corridor view showing both classroom doors of Kelas 1-A
    if (tp === "corridor" || tp === "class1a_doors") return [14.2, 1.6, 110.0];
    // (b) inside classroom from rear looking at blackboard with windows on right
    if (tp === "class1a_rear" || tp === "class1a") return [13.0, 1.5, 114.5];
    // (d) seat view looking out window at sports field
    if (tp === "class1a_seat") return [9.6, 1.25, 117.5];
    if (tp === "library") return [-31.0, 1.6, 115.0];
    if (tp === "lab") return [-19.0, 1.6, 115.0];
    if (tp === "genkan") return [0, 1.6, 101.0];
    if (tp === "gate") return [0, 1.6, 2.0];
    if (tp === "fountain") return [0, 1.6, 62.0];
    if (tp === "okujo") return [0, 13.6, 111.0];
  }
  return [0, 1.6, 2];
};

export const useSakuraStore = create<SakuraState>((set) => ({
  cameraMode: getInitialCameraMode(),
  selectedFloor: "ALL",
  fieldMode: "BOTH",
  hoveredRoom: null,
  activeRoomDetail: null,
  teleportPosition: getInitialTeleport(),
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
