import { prisma } from "@/lib/db";

/**
 * Utilitas untuk memastikan data awal forum mading, materi terbuka,
 * pengumuman kelas, dan materi kelas terdaftar secara idempoten di database.
 */
export async function ensureForumAndMaterialsSeeded(): Promise<void> {
  const [threadCount, materialCount, announcementCount] = await Promise.all([
    prisma.thread.count(),
    prisma.learningMaterial.count(),
    prisma.announcement.count(),
  ]);

  // Cari user dan kelas untuk relasi author/class
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Admin BAZMA",
        email: "admin@smkbazma.sch.id",
        role: "ADMIN",
      },
    });
  }

  const defaultClass = await prisma.class.findFirst();

  // 1. Seed Thread Mading & Papan Diskusi Kelas
  if (threadCount === 0) {
    // Thread Global 1 (Mading)
    const thread1 = await prisma.thread.create({
      data: {
        title: "[TANYA] Cara konfigurasi VLAN Trunk di MikroTik RouterOS v7?",
        content:
          "Halo kawan-kawan SIJA. Saya sedang mencoba konfigurasi VLAN Trunking pada switch MikroTik RB951 menggunakan RouterOS v7. Apakah sekarang wajib memakai vlan-filtering=yes di interface bridge, atau masih ada cara lama yang stabil?",
        category: "JARINGAN & SERVER",
        votes: 14,
        isPinned: true,
        hasBestAnswer: true,
        authorId: user.id,
        classId: null, // Mading Global
      },
    });

    // Komentar Jawaban Terbaik (Depth 1)
    const comment1 = await prisma.comment.create({
      data: {
        threadId: thread1.id,
        authorId: user.id,
        content:
          "Di RouterOS v7 sangat disarankan menggunakan bridge VLAN filtering (`/interface bridge vlan`) agar switch chip hardware offloading (HW-offload) tetap aktif. Pastikan bridge pvid sudah sesuai.",
        isBestAnswer: true,
        depth: 1,
      },
    });

    // Balasan Komentar (Depth 2)
    await prisma.comment.create({
      data: {
        threadId: thread1.id,
        authorId: user.id,
        parentId: comment1.id,
        content:
          "Siap terima kasih kak! Setelah mengaktifkan vlan-filtering=yes dan mendefinisikan tagged/untagged port di bridge vlan, konfigurasinya langsung berjalan mulus.",
        depth: 2,
      },
    });

    // Thread Global 2 (Mading)
    await prisma.thread.create({
      data: {
        title: "[TIPS] Panduan deploy Proxmox VE 8 untuk Lab Mandiri",
        content:
          "Bagi teman-teman yang ingin belajar virtualisasi di laptop/PC spek pas-pasan, berikut ringkasan konfigurasi LVM-Thin dan Linux Bridge agar alokasi storage hemat.",
        category: "VIRTUALISASI",
        votes: 9,
        isPinned: false,
        hasBestAnswer: false,
        authorId: user.id,
        classId: null, // Mading Global
      },
    });

    // Jika ada kelas, buatkan Thread Diskusi Kelas
    if (defaultClass) {
      await prisma.thread.create({
        data: {
          title: "Diskusi Tugas 02: Analisis Topologi Star vs Ring",
          content:
            "Silakan kumpulkan pertanyaan atau kendala terkait simulasi Cisco Packet Tracer tugas 02 di thread ini sebelum batas waktu hari Kamis.",
          category: "TUGAS & DISKUSI",
          votes: 5,
          isPinned: true,
          hasBestAnswer: false,
          authorId: user.id,
          classId: defaultClass.id,
        },
      });
    }
  }

  // 2. Seed Materi Pembelajaran (Perpustakaan Terbuka & Rak Materi Kelas)
  if (materialCount === 0) {
    // Materi Terbuka (Perpustakaan)
    await prisma.learningMaterial.createMany({
      data: [
        {
          title: "Modul Praktikum Jaringan Komputer Dasar v2.4",
          description: "Panduan konfigurasi routing statis, DHCP server, dan subnetting IPv4.",
          category: "JARINGAN & SERVER",
          fileFormat: "PDF",
          fileSize: "4.2 MB",
          fileUrl: "/materials/modul-jarkom-dasar.pdf",
          authorId: user.id,
          classId: null,
        },
        {
          title: "Panduan Instalasi Proxmox VE 8.1 untuk Server Lab",
          description: "Langkah-langkah deployment Proxmox baremetal pada perangkat workstation lab.",
          category: "VIRTUALISASI",
          fileFormat: "PDF",
          fileSize: "2.8 MB",
          fileUrl: "/materials/panduan-proxmox-ve.pdf",
          authorId: user.id,
          classId: null,
        },
        {
          title: "Cheat Sheet Perintah Linux Terminal & Bash Scripting",
          description: "Daftar ringkas perintah utilitas Linux untuk administrasi server Debian & Ubuntu.",
          category: "SISTEM OPERASI",
          fileFormat: "PDF",
          fileSize: "1.5 MB",
          fileUrl: "/materials/cheatsheet-linux.pdf",
          authorId: user.id,
          classId: null,
        },
      ],
    });

    // Materi Kelas (Rak Materi Kelas)
    if (defaultClass) {
      await prisma.learningMaterial.createMany({
        data: [
          {
            title: "Slide Kuliah 04: Pengalamatan IPv6 dan Dual Stack",
            description: "Slide materi pengenalan struktur IPv6, link-local, dan transisi dual stack.",
            category: "MATERI KELAS",
            fileFormat: "PDF",
            fileSize: "3.1 MB",
            fileUrl: "/materials/slide-ipv6-dualstack.pdf",
            authorId: user.id,
            classId: defaultClass.id,
          },
          {
            title: "Lembar Kerja Siswa: Troubleshooting VLAN 802.1Q",
            description: "Skenario error konfigurasi trunking dan langkah investigasinya.",
            category: "LEMBAR KERJA",
            fileFormat: "PDF",
            fileSize: "850 KB",
            fileUrl: "/materials/lks-vlan-troubleshoot.pdf",
            authorId: user.id,
            classId: defaultClass.id,
          },
        ],
      });
    }
  }

  // 3. Seed Pengumuman Kelas (Papan Tulis Kelas)
  if (announcementCount === 0 && defaultClass) {
    await prisma.announcement.createMany({
      data: [
        {
          title: "Praktikum Jaringan Dasar Pekan Depan",
          content:
            "Harap membawa kabel UTP Cat5e/6 masing-masing minimal 2 meter beserta tang crimping. Kita akan praktik crimping straight & crossover di Lab 2.",
          isPinned: true,
          authorId: user.id,
          classId: defaultClass.id,
        },
        {
          title: "Jadwal Ujian Tengah Semester Teori Jaringan",
          content:
            "UTS Teori Jaringan akan diadakan hari Selasa pukul 08.00 WIB di Lab Komputer 1. Materi mencakup Bab 1 sampai Bab 4.",
          isPinned: false,
          authorId: user.id,
          classId: defaultClass.id,
        },
      ],
    });
  }
}
