import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt: string | null;
  category: "eksplorasi" | "belajar" | "sosial";
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "welcome",
    title: "Langkah Pertama",
    description: "Masuk dan mengunjungi kampus virtual SMK TI BAZMA.",
    iconName: "Compass",
    unlockedAt: null,
    category: "eksplorasi",
  },
  {
    id: "map_opened",
    title: "Navigasi Andal",
    description: "Membuka peta 2D kawasan kampus untuk melihat denah sekolah.",
    iconName: "Map",
    unlockedAt: null,
    category: "eksplorasi",
  },
  {
    id: "library_open",
    title: "Kutu Buku",
    description: "Melihat modul pembelajaran di perpustakaan digital.",
    iconName: "BookOpen",
    unlockedAt: null,
    category: "belajar",
  },
  {
    id: "mading_read",
    title: "Kabar Mading",
    description: "Membuka dan membaca topik diskusi di papan mading sekolah.",
    iconName: "Radio",
    unlockedAt: null,
    category: "belajar",
  },
  {
    id: "friends_browse",
    title: "Cari Teman",
    description: "Melihat direktori rekan belajar dan siswa sekolah.",
    iconName: "Users",
    unlockedAt: null,
    category: "sosial",
  },
  {
    id: "options_explored",
    title: "Penata Pengaturan",
    description: "Membuka panel opsi untuk menyesuaikan grafik dan suara.",
    iconName: "Sliders",
    unlockedAt: null,
    category: "eksplorasi",
  },
  {
    id: "stuck_rescued",
    title: "Penyelamat Spasial",
    description: "Menggunakan tombol 'Aku tersangkut' untuk kembali ke gerbang utama.",
    iconName: "LifeBuoy",
    unlockedAt: null,
    category: "eksplorasi",
  },
];

interface AchievementStore {
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  resetAchievements: () => void;
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set) => ({
      achievements: INITIAL_ACHIEVEMENTS,
      unlockAchievement: (id: string) =>
        set((state) => ({
          achievements: state.achievements.map((item) =>
            item.id === id && !item.unlockedAt
              ? { ...item, unlockedAt: new Date().toISOString() }
              : item
          ),
        })),
      resetAchievements: () =>
        set({
          achievements: INITIAL_ACHIEVEMENTS,
        }),
    }),
    {
      name: "bazma-achievements",
    }
  )
);

