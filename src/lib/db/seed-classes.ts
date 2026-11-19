import { prisma } from "@/lib/db";

/**
 * Utilitas untuk memastikan kelas default SMK TI BAZMA dan rekan sekelas (classmates)
 * terdaftar secara idempoten di database Neon PostgreSQL.
 */
export async function ensureClassesAndClassmatesSeeded(): Promise<void> {
  // 1. Pastikan Guru Pengajar Terdaftar
  let teacher = await prisma.user.findFirst({
    where: { email: "guru.budi@smkbazma.sch.id" },
  });

  if (!teacher) {
    teacher = await prisma.user.create({
      data: {
        name: "Pak Budi Santoso, S.Kom.",
        displayName: "Budi Santoso",
        username: "pak_budi",
        email: "guru.budi@smkbazma.sch.id",
        role: "ADMIN",
        bio: "Guru Produktif SIJA - Pengampu Jaringan Komputer, Server & Komputasi Awan SMK TI BAZMA.",
      },
    });
  }

  // 2. Pastikan Kelas Utama SIJA10A dan SIJA11B Terdaftar
  let class1 = await prisma.class.findUnique({
    where: { code: "SIJA10A" },
  });

  if (!class1) {
    class1 = await prisma.class.create({
      data: {
        name: "X SIJA 1 - Jaringan & Cloud",
        code: "SIJA10A",
        description:
          "Ruang kelas virtual SIJA tingkat 10. Materi: Konfigurasi VLAN Trunking, Routing MikroTik, Linux Server Debian, dan Pengkabelan UTP.",
        roomLayout: "standard-30",
        createdById: teacher.id,
      },
    });

    // Masukkan guru sebagai TEACHER
    await prisma.classMember.create({
      data: {
        classId: class1.id,
        userId: teacher.id,
        role: "TEACHER",
        seatIndex: null,
      },
    });
  }

  let class2 = await prisma.class.findUnique({
    where: { code: "SIJA11B" },
  });

  if (!class2) {
    class2 = await prisma.class.create({
      data: {
        name: "XI SIJA 2 - Sistem Komputasi & IoT",
        code: "SIJA11B",
        description:
          "Ruang kelas virtual SIJA tingkat 11. Materi: Virtualisasi Proxmox VE, Docker Container, IoT Gateway, dan Otomasi Server.",
        roomLayout: "standard-30",
        createdById: teacher.id,
      },
    });

    // Masukkan guru sebagai TEACHER
    await prisma.classMember.create({
      data: {
        classId: class2.id,
        userId: teacher.id,
        role: "TEACHER",
        seatIndex: null,
      },
    });
  }

  // 3. Pastikan Rekan Siswa (Classmates) Terdaftar
  const mockStudents = [
    {
      name: "Rizky Pratama",
      displayName: "Rizky Pratama",
      username: "rizky_pratama",
      email: "rizky@smkbazma.sch.id",
      bio: "Siswa X SIJA 1. Hobi konfigurasi MikroTik & routing OSPF.",
      seatIndex: 0,
    },
    {
      name: "Ahmad Fauzi",
      displayName: "Ahmad Fauzi",
      username: "ahmad_fauzi",
      email: "fauzi@smkbazma.sch.id",
      bio: "Siswa X SIJA 1. Antusias di bidang Linux Server & Keamanan Jaringan.",
      seatIndex: 1,
    },
    {
      name: "Nadia Safitri",
      displayName: "Nadia Safitri",
      username: "nadia_safitri",
      email: "nadia@smkbazma.sch.id",
      bio: "Siswa X SIJA 1. Belajar Web Development & Cloud Infrastructure.",
      seatIndex: 2,
    },
    {
      name: "Bima Satria",
      displayName: "Bima Satria",
      username: "bima_satria",
      email: "bima@smkbazma.sch.id",
      bio: "Siswa X SIJA 1. Penggemar perangkat keras komputer & server rack.",
      seatIndex: 3,
    },
  ];

  for (const s of mockStudents) {
    let studentUser = await prisma.user.findFirst({
      where: { email: s.email },
    });

    if (!studentUser) {
      studentUser = await prisma.user.create({
        data: {
          name: s.name,
          displayName: s.displayName,
          username: s.username,
          email: s.email,
          bio: s.bio,
          role: "USER",
        },
      });
    }

    // Daftarkan ke kelas SIJA10A jika belum
    const existingMembership = await prisma.classMember.findUnique({
      where: {
        userId_classId: {
          userId: studentUser.id,
          classId: class1.id,
        },
      },
    });

    if (!existingMembership) {
      await prisma.classMember.create({
        data: {
          userId: studentUser.id,
          classId: class1.id,
          role: "STUDENT",
          seatIndex: s.seatIndex,
        },
      });
    }
  }

  // 4. Pastikan ada percakapan sambutan awal antara Rizky Pratama dan Guru Budi di SIJA10A
  const student1 = await prisma.user.findFirst({ where: { email: "rizky@smkbazma.sch.id" } });
  if (student1 && teacher) {
    const existingConv = await prisma.conversation.findFirst({
      where: {
        classId: class1.id,
        OR: [
          { user1Id: teacher.id, user2Id: student1.id },
          { user1Id: student1.id, user2Id: teacher.id },
        ],
      },
    });

    if (!existingConv) {
      const conv = await prisma.conversation.create({
        data: {
          classId: class1.id,
          user1Id: teacher.id,
          user2Id: student1.id,
        },
      });

      await prisma.message.create({
        data: {
          conversationId: conv.id,
          senderId: teacher.id,
          content: "Selamat datang di kelas SIJA 1! Silakan cek papan tulis kelas untuk materi praktikum pekan ini.",
        },
      });
    }
  }
}

