"use client";

import * as React from "react";
import * as Ably from "ably";
import {
  shouldSendPositionUpdate,
  calculatePresenceSummary,
  type PlayerPositionPayload,
} from "./throttler";

export interface PeerPlayerState extends PlayerPositionPayload {
  userId: string;
  name: string;
  seatIndex: number | null;
}

interface UseClassroomPresenceOptions {
  classId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserSeatIndex: number | null;
  classMembers: { userId: string; seatIndex: number | null; name: string }[];
}

export function useClassroomPresence({
  classId,
  currentUserId,
  currentUserName,
  currentUserSeatIndex,
  classMembers,
}: UseClassroomPresenceOptions) {
  const [onlineUserIds, setOnlineUserIds] = React.useState<Set<string>>(() => new Set([currentUserId]));
  const [peerPositions, setPeerPositions] = React.useState<Map<string, PeerPlayerState>>(() => new Map());
  const [isConnected, setIsConnected] = React.useState(false);
  const [isFallback, setIsFallback] = React.useState(false);

  const channelRef = React.useRef<Ably.RealtimeChannel | null>(null);
  const clientRef = React.useRef<Ably.Realtime | null>(null);

  // Inisialisasi koneksi Ably & Presence
  React.useEffect(() => {
    let isCancelled = false;

    async function initPresence() {
      try {
        const authRes = await fetch(`/api/realtime/auth?classId=${encodeURIComponent(classId)}`);
        if (!authRes.ok) {
          throw new Error("Gagal mengautentikasi token realtime");
        }

        const authData = await authRes.json();

        // Mode fallback jika Ably API key belum dipasang
        if (authData.isFallback) {
          if (!isCancelled) {
            setIsFallback(true);
            setIsConnected(true);
            setOnlineUserIds(new Set([currentUserId]));
          }
          return;
        }

        // Mode Live Ably WebSocket
        const client = new Ably.Realtime({
          authCallback: async (_data, callback) => {
            try {
              const res = await fetch(`/api/realtime/auth?classId=${encodeURIComponent(classId)}`);
              const tokenReq = await res.json();
              callback(null, tokenReq);
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : "Auth error";
              callback(errorMessage, null);
            }
          },
        });

        if (isCancelled) {
          client.close();
          return;
        }

        clientRef.current = client;
        const channelName = `classroom:${classId}`;
        const channel = client.channels.get(channelName);
        channelRef.current = channel;

        // Status koneksi
        client.connection.on("connected", () => {
          if (!isCancelled) setIsConnected(true);
        });

        client.connection.on("disconnected", () => {
          if (!isCancelled) setIsConnected(false);
        });

        client.connection.on("failed", () => {
          if (!isCancelled) {
            setIsConnected(false);
            setIsFallback(true);
          }
        });

        // Masuk ke daftar Presence ruang kelas
        await channel.presence.enter({
          userId: currentUserId,
          name: currentUserName,
          seatIndex: currentUserSeatIndex,
        });

        // Ambil daftar presence awal
        const presenceMembers = await channel.presence.get();
        if (!isCancelled) {
          const ids = new Set<string>();
          ids.add(currentUserId);
          for (const m of presenceMembers) {
            if (m.data?.userId) ids.add(m.data.userId);
            else if (m.clientId) ids.add(m.clientId);
          }
          setOnlineUserIds(ids);
        }

        // Berlangganan perubahan Presence (masuk, keluar, update)
        channel.presence.subscribe(["enter", "update"], (msg) => {
          if (isCancelled) return;
          const uid = msg.data?.userId || msg.clientId;
          if (uid) {
            setOnlineUserIds((prev) => new Set([...prev, uid]));
          }
        });

        channel.presence.subscribe("leave", (msg) => {
          if (isCancelled) return;
          const uid = msg.data?.userId || msg.clientId;
          if (uid) {
            setOnlineUserIds((prev) => {
              const next = new Set(prev);
              next.delete(uid);
              return next;
            });
            // Hapus avatar pemain yang keluar
            setPeerPositions((prev) => {
              const next = new Map(prev);
              next.delete(uid);
              return next;
            });
          }
        });

        // Berlangganan pesan posisi multiplayer antar-siswa di kelas ini
        channel.subscribe("player-pos", (msg) => {
          if (isCancelled) return;
          const data = msg.data;
          if (!data || !data.userId || data.userId === currentUserId) return;

          setPeerPositions((prev) => {
            const next = new Map(prev);
            next.set(data.userId, {
              userId: data.userId,
              name: data.name || "Siswa",
              seatIndex: data.seatIndex ?? null,
              x: data.x,
              y: data.y,
              z: data.z,
              rotY: data.rotY,
            });
            return next;
          });
        });
      } catch (err) {
        console.warn("Realtime presence offline fallback:", err);
        if (!isCancelled) {
          setIsFallback(true);
          setIsConnected(true);
          setOnlineUserIds(new Set([currentUserId]));
        }
      }
    }

    initPresence();

    return () => {
      isCancelled = true;
      if (channelRef.current) {
        channelRef.current.presence.leave().catch(() => {});
        channelRef.current.unsubscribe();
      }
      if (clientRef.current) {
        clientRef.current.close();
      }
    };
  }, [classId, currentUserId, currentUserName, currentUserSeatIndex]);

  // Pelacakan waktu dan koordinat terakhir untuk pembatasan laju 10Hz (throttling)
  const lastSentTimeRef = React.useRef(0);
  const lastSentPosRef = React.useRef<PlayerPositionPayload | null>(null);

  const broadcastPosition = React.useCallback(
    (pos: PlayerPositionPayload) => {
      const now = Date.now();
      if (!shouldSendPositionUpdate(lastSentPosRef.current, pos, lastSentTimeRef.current, now, 100)) {
        return;
      }
      lastSentTimeRef.current = now;
      lastSentPosRef.current = { ...pos };

      if (channelRef.current && isConnected && !isFallback) {
        channelRef.current
          .publish("player-pos", {
            userId: currentUserId,
            name: currentUserName,
            seatIndex: currentUserSeatIndex,
            ...pos,
          })
          .catch(() => {});
      }
    },
    [currentUserId, currentUserName, currentUserSeatIndex, isConnected, isFallback]
  );

  // Ringkasan status lampu meja dan kehadiran
  const { activeStudentCount, activeSeatIndices } = React.useMemo(() => {
    return calculatePresenceSummary(onlineUserIds, classMembers);
  }, [onlineUserIds, classMembers]);

  return {
    onlineUserIds,
    activeStudentCount,
    activeSeatIndices,
    peerPositions,
    broadcastPosition,
    isConnected,
    isFallback,
  };
}

