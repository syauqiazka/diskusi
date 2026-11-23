import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { env } from "@/lib/env";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per aturan AGENTS.md

export async function POST(req: NextRequest) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Harap masuk log terlebih dahulu untuk mengunggah berkas." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Tidak ada berkas yang dikirimkan." },
        { status: 400 }
      );
    }

    // Validasi Tipe MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Format berkas tidak didukung. Format yang diizinkan: JPG, PNG, WebP, GIF, atau PDF.",
        },
        { status: 400 }
      );
    }

    // Validasi Ukuran Maksimal 10 MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Ukuran berkas melebihi batas maksimal 10 MB.",
        },
        { status: 400 }
      );
    }

    const token =
      env.BLOB_READ_WRITE_TOKEN ||
      process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN belum dikonfigurasi di server." },
        { status: 500 }
      );
    }

    // Sanitasi nama berkas (hanya alfanumerik, titik, strip, underscore)
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniquePath = `uploads/${session.user.id}/${Date.now()}-${sanitizedName}`;

    const blob = await put(uniquePath, file, {
      access: "public",
      token,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: file.size,
    });
  } catch (error) {
    console.error("Gagal mengunggah ke Vercel Blob:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan sistem saat mengunggah berkas.",
      },
      { status: 500 }
    );
  }
}

