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

