import { NextRequest, NextResponse } from "next/server";
import * as Ably from "ably";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Harap masuk log terlebih dahulu." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  if (!classId) {
    return NextResponse.json(
      { error: "Parameter classId wajib disertakan." },
      { status: 400 }
    );
  }

  // Verifikasi keanggotaan kelas di database
  const membership = await prisma.classMember.findUnique({
    where: {
      userId_classId: {
        userId: session.user.id,
        classId: classId,
      },
    },
  });

  if (!membership && session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Akses ditolak: Anda bukan anggota kelas ini." },
      { status: 403 }
    );
  }

  // Jika ABLY_API_KEY tidak dikonfigurasi, sediakan sinyal fallback graceful
  const apiKey = env.ABLY_API_KEY || process.env.ABLY_API_KEY;
  if (!apiKey || apiKey.includes("your-ably-api-key")) {
    return NextResponse.json({
      isFallback: true,
      clientId: session.user.id,
      seatIndex: membership?.seatIndex ?? null,
      message: "Ably API key belum dikonfigurasi. Menggunakan fallback status kehadiran lokal.",
    });
  }

  try {
    const client = new Ably.Rest(apiKey);

    // Batasi kemampuan (capability) token hanya pada channel kelas ini
    const channelName = `classroom:${classId}`;
    const tokenParams: Ably.TokenParams = {
      clientId: session.user.id,
      capability: {
        [channelName]: ["subscribe", "publish", "presence"],
      },
      ttl: 3600 * 1000, // 1 jam
    };

    const tokenRequest = await client.auth.createTokenRequest(tokenParams);
    return NextResponse.json(tokenRequest);
  } catch (error) {
    console.error("Gagal membuat token Ably:", error);
    return NextResponse.json(
      { error: "Gagal membuat otentikasi token realtime." },
      { status: 500 }
    );
  }
}

