import { ClassRole } from "@prisma/client";

export interface ClassroomMemberUser {
  id: string;
  name: string;
  displayName: string | null;
  username: string | null;
  image: string | null;
  role: string;
}

export interface ClassroomMemberDetail {
  id: string;
  role: ClassRole;
  seatIndex: number | null;
  joinedAt: Date;
  user: ClassroomMemberUser;
}

export interface ClassroomDetail {
  id: string;
  name: string;
  code: string;
  description: string | null;
  roomLayout: string;
  members: ClassroomMemberDetail[];
  createdBy?: {
    id: string;
    name: string;
    displayName: string | null;
  };
}

export interface DoorAccessStatus {
  isMember: boolean;
  isLocked: boolean;
  classId?: string;
  className: string;
  classCode: string;
  description?: string | null;
  roomLayout: string;
  role?: string;
  seatIndex?: number | null;
}

export interface LokerProfileData {
  isLoggedIn: boolean;
  user?: {
    id: string;
    name: string;
    username: string | null;
    displayName: string | null;
    bio: string | null;
    role: string;
    email: string;
    activeFrameId: string | null;
    activeEffectId: string | null;
  };
  classes: Array<{
    classId: string;
    className: string;
    classCode: string;
    seatIndex: number | null;
    role: string;
  }>;
}

export interface CosmeticItem {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  assetUrl?: string;
  configKey?: string;
}

export interface CerminCatalogData {
  frames: CosmeticItem[];
  effects: CosmeticItem[];
  activeFrameId: string | null;
  activeEffectId: string | null;
}


