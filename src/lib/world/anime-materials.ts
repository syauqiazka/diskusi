import * as THREE from 'three';

/**
 * Membuat 4-step ramp gradient texture untuk MeshToonMaterial ala anime (Kyoto Animation look).
 * Memberikan bayangan tegas berundak dengan batas lembut kebiruan.
 */
export function createToonGradientMap(steps: number = 4): THREE.DataTexture {
  const width = steps;
  const data = new Uint8Array(width * 4);

  // Nilai intensitas kecerahan berundak (ambient shadow -> mid shadow -> diffuse -> highlight)
  const rampValues = [
    [140, 155, 185], // Shadow kebiruan lembut
    [190, 200, 218], // Mid shadow
    [235, 238, 245], // Diffuse tone
    [255, 255, 255], // Full highlight
  ];

  for (let i = 0; i < width; i++) {
    const val = rampValues[Math.min(i, rampValues.length - 1)];
    const stride = i * 4;
    data[stride] = val[0];
    data[stride + 1] = val[1];
    data[stride + 2] = val[2];
    data[stride + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, width, 1, THREE.RGBAFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

// Singleton gradient texture
let _sharedGradientMap: THREE.DataTexture | null = null;
export function getSharedGradientMap(): THREE.DataTexture {
  if (!_sharedGradientMap) {
    _sharedGradientMap = createToonGradientMap(4);
  }
  return _sharedGradientMap;
}

/**
 * Palet Warna Anime Khas Kyoto Animation (Daylight & Cerah)
 */
export const ANIME_PALETTE = {
  // Arsitektur Gedung Sekolah
  wallIvory: '#F9F8F3', // Dinding putih hangat gading
  wallCream: '#F1EEDB', // Aksen dinding bawah / selasar
  pillarWhite: '#FFFFFF', // Tiang vertikal putih bersih
  slabTrim: '#DDE3EA', // Garis pelat lantai tipis
  windowGlassDay: '#70B8F8', // Kaca jendela biru cerah anime
  windowGlassSunset: '#FFBA7A', // Kaca jendela pantulan senja
  windowGlassNight: '#FDE047', // Kaca jendela menyala kuning hangat malam
  windowFrameWood: '#5A4638', // Kusen kayu jendela geser
  windowFrameAlum: '#94A3B8', // Kusen alumunium jendela geser luar
  doorWood: '#8D5B4C', // Pintu kayu geser anime
  doorGlass: '#BAE6FD', // Panel kaca pintu

  // Rooftop / Atap Sekolah Anime
  roofConcrete: '#94A3B8', // Lantai semen rooftop
  roofFencePost: '#2D6A4F', // Tiang pagar hijau tua khas anime
  roofFenceWire: '#64748B', // Kawat ram pengaman rooftop
  waterTankSilver: '#E2E8F0', // Tangki air stainless steel
  waterTankLegs: '#334155', // Kaki besi tangki air
  stairShackWall: '#F8FAFC', // Bilik penutup tangga rooftop
  stairShackDoor: '#334155', // Pintu besi rooftop

  // Interior Kelas & Lorong
  floorParquet: '#D4A373', // Parket kayu lorong & kelas
  blackboardGreen: '#1B4332', // Papan tulis kapur hijau tua
  blackboardFrame: '#5A3E2B', // Bingkai papan tulis kayu
  deskWood: '#C68B59', // Meja siswa kayu hangat
  deskLegs: '#475569', // Kaki meja besi abu-abu
  chairWood: '#B27848', // Kursi siswa kayu
  curtainWhite: '#FFFFFF', // Tirai jendela putih melayang
  shoeLockerWood: '#B08968', // Rak loker sepatu (Getabako)
  bulletinBoardCork: '#DDA15E', // Papan pengumuman gabus
  bulletinBoardFrame: '#606C38', // Bingkai papan pengumuman

  // Vegetasi & Luar Ruangan
  sakuraPetal: '#FFB7C5', // Kelopak bunga sakura merah muda cerah
  sakuraPetalDark: '#F48FB1', // Bayangan kelopak sakura
  sakuraBark: '#4A3525', // Batang pohon sakura cokelat gelap
  hedgeGreen: '#52B788', // Semak tanaman pagar hijau segar
  lawnGreen: '#74C69D', // Rumput halaman cerah
  flowerBedRed: '#E63946', // Bunga merah
  flowerBedYellow: '#FFD166', // Bunga kuning
  flowerBedBlue: '#4EA8DE', // Bunga biru

  // Fasilitas & Prop Kampus
  vendingBlue: '#2563EB', // Mesin minuman biru
  vendingRed: '#DC2626', // Mesin minuman merah
  vendingScreen: '#E0F2FE', // Display lampu mesin
  bikeRackMetal: '#94A3B8', // Rak sepeda metal
  benchWood: '#A26744', // Bangku taman kayu
  gatePostStone: '#E2E8F0', // Tiang gerbang batu
  gateIronBar: '#1E293B', // Pagar besi gerbang hitam
  clockFace: '#FFFFFF', // Muka jam dinding putih
  clockBorder: '#1E293B', // Bingkai jam dinding
  clockHand: '#0F172A', // Jarum jam hitam

  // Asrama Siswa
  asramaWall: '#FDFBF7', // Dinding asrama bersih
  asramaBalconyRail: '#3B82F6', // Railing balkon biru pastel
  asramaCanopy: '#64748B', // Kanopi balkon
} as const;

/**
 * Pustaka Material Toon Anime Siap Pakai
 */
export function createAnimeMaterials(gradientMap: THREE.DataTexture) {
  return {
    wallIvory: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.wallIvory),
      gradientMap,
    }),
    wallCream: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.wallCream),
      gradientMap,
    }),
    pillarWhite: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.pillarWhite),
      gradientMap,
    }),
    slabTrim: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.slabTrim),
      gradientMap,
    }),
    windowGlassDay: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.windowGlassDay),
      gradientMap,
      transparent: true,
      opacity: 0.85,
    }),
    windowGlassNight: new THREE.MeshBasicMaterial({
      color: new THREE.Color(ANIME_PALETTE.windowGlassNight),
    }),
    windowFrame: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.windowFrameWood),
      gradientMap,
    }),
    windowFrameAlum: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.windowFrameAlum),
      gradientMap,
    }),
    doorWood: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.doorWood),
      gradientMap,
    }),
    roofConcrete: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.roofConcrete),
      gradientMap,
    }),
    roofFencePost: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.roofFencePost),
      gradientMap,
    }),
    waterTankSilver: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.waterTankSilver),
      gradientMap,
    }),
    waterTankLegs: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.waterTankLegs),
      gradientMap,
    }),
    stairShackWall: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.stairShackWall),
      gradientMap,
    }),
    floorParquet: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.floorParquet),
      gradientMap,
    }),
    blackboard: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.blackboardGreen),
      gradientMap,
    }),
    deskWood: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.deskWood),
      gradientMap,
    }),
    deskLegs: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.deskLegs),
      gradientMap,
    }),
    curtainWhite: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.curtainWhite),
      gradientMap,
      transparent: true,
      opacity: 0.8,
    }),
    shoeLocker: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.shoeLockerWood),
      gradientMap,
    }),
    sakuraPetal: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.sakuraPetal),
      gradientMap,
    }),
    sakuraBark: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.sakuraBark),
      gradientMap,
    }),
    hedgeGreen: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.hedgeGreen),
      gradientMap,
    }),
    lawnGreen: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.lawnGreen),
      gradientMap,
    }),
    vendingBlue: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.vendingBlue),
      gradientMap,
    }),
    vendingRed: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.vendingRed),
      gradientMap,
    }),
    benchWood: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.benchWood),
      gradientMap,
    }),
    metalDark: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.gateIronBar),
      gradientMap,
    }),
    stoneLight: new THREE.MeshToonMaterial({
      color: new THREE.Color(ANIME_PALETTE.gatePostStone),
      gradientMap,
    }),
    clockFace: new THREE.MeshBasicMaterial({
      color: new THREE.Color(ANIME_PALETTE.clockFace),
    }),
    clockHand: new THREE.MeshBasicMaterial({
      color: new THREE.Color(ANIME_PALETTE.clockHand),
    }),
    // Outline inverted hull material (BackSide, solid dark outline)
    outlineMaterial: new THREE.MeshBasicMaterial({
      color: new THREE.Color('#2C3E50'),
      side: THREE.BackSide,
    }),
  };
}

