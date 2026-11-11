import type {
  DoorAccessStatus,
  LokerProfileData,
} from "@/lib/classroom/types";

export interface RawClassData {
  id: string;
  name: string;
  code: string;
  description: string | null;
  roomLayout: string;
  members: Array<{
    userId: string;
    role: string;
    seatIndex: number | null;
  }>;
}

export interface RawUserData {
  id: string;
  name: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  role: string;
  email: string;
  activeFrameId: string | null;
  activeEffectId: string | null;
  memberships: Array<{
    seatIndex: number | null;
    role: string;
    class: {
      id: string;
      name: string;
      code: string;
    };
  }>;
}

/**
 * Logika murni penentuan status kunci pintu kelas (3.2 & 3.3)
 */
export function parseDoorStatus(
  currentUserId: string | null,
  rawClass: RawClassData | null
): DoorAccessStatus {
  if (!rawClass) {
    return {
      isMember: false,
      isLocked: true,
      className: "KELAS TIDAK DITEMUKAN",
      classCode: "-",
      roomLayout: "standard-30",
    };
  }

  if (!currentUserId) {
    return {
      isMember: false,
      isLocked: true,
      classId: rawClass.id,
      className: rawClass.name,
      classCode: rawClass.code,
      description: rawClass.description,
      roomLayout: rawClass.roomLayout,
    };
  }

  const myMembership = rawClass.members.find((m) => m.userId === currentUserId);

  if (!myMembership) {
    return {
      isMember: false,
      isLocked: true,
      classId: rawClass.id,
      className: rawClass.name,
      classCode: rawClass.code,
      description: rawClass.description,
      roomLayout: rawClass.roomLayout,
    };
  }

  return {
    isMember: true,
    isLocked: false,
    classId: rawClass.id,
    className: rawClass.name,
    classCode: rawClass.code,
    description: rawClass.description,
    roomLayout: rawClass.roomLayout,
    role: myMembership.role,
    seatIndex: myMembership.seatIndex,
  };
}

/**
 * Logika murni format profil loker siswa (7.1)
 */
export function formatLokerProfile(rawUser: RawUserData | null): LokerProfileData {
  if (!rawUser) {
    return {
      isLoggedIn: false,
      classes: [],
    };
  }

  return {
    isLoggedIn: true,
    user: {
      id: rawUser.id,
      name: rawUser.name,
      username: rawUser.username,
      displayName: rawUser.displayName,
      bio: rawUser.bio,
      role: rawUser.role,
      email: rawUser.email,
      activeFrameId: rawUser.activeFrameId,
      activeEffectId: rawUser.activeEffectId,
    },
    classes: rawUser.memberships.map((m) => ({
      classId: m.class.id,
      className: m.class.name,
      classCode: m.class.code,
      seatIndex: m.seatIndex,
      role: m.role,
    })),
  };
}

/**
 * Validasi input bio loker
 */
export function validateBioInput(rawBio: string): {
  valid: boolean;
  cleaned?: string;
  error?: string;
} {
  const trimmed = rawBio.trim();
  if (trimmed.length > 200) {
    return {
      valid: false,
      error: "Bio maksimal 200 karakter.",
    };
  }
  return {
    valid: true,
    cleaned: trimmed,
  };
}

