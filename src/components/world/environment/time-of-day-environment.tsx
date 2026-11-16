/**
 * Komponen Lingkungan Waktu Realtime Tiga Dimensi (React Three Fiber)
 * Kawasan SMK TI BAZMA
 *
 * Mengatur pencahayaan dinamis, posisi matahari/bulan, kabut atmosfer,
 * kubah langit gradien, taburan bintang, partikel debu udara, dan lapisan awan.
 */

"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { TIME_OF_DAY_CONFIG, TimePhase } from '@/lib/world/time-of-day.config';
import { useTimeOfDayStore } from '@/stores/use-time-of-day-store';
import { SkyClouds } from './sky-clouds';

// Variabel scratch dialokasikan sekali di tingkat modul (Zero GC per frame)
const _scratchColorA = new THREE.Color();
const _scratchColorB = new THREE.Color();
const _sunPos = new THREE.Vector3();
const _moonPos = new THREE.Vector3();
const _sunDir = new THREE.Vector3();
const _moonDir = new THREE.Vector3();
const _activeCelestialDir = new THREE.Vector3();
const _currentLightDir = new THREE.Vector3();

// Scratch color untuk hasil blend (Zero GC)
const _blendedSkyTop = new THREE.Color();
const _blendedSkyBottom = new THREE.Color();
const _blendedCelestialColor = new THREE.Color();
const _blendedAmbientColor = new THREE.Color();
const _blendedFogColor = new THREE.Color();
const _blendedDustColor = new THREE.Color();
const _blendedLampColor = new THREE.Color();
const _blendedLampEmissiveColor = new THREE.Color();

// Vertex & fragment shader untuk kubah langit gradien ringan
const skyVertexShader = `
  varying vec3 vLocalDir;
  void main() {
    vLocalDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragmentShader = `
  uniform vec3 uTopColor;
  uniform vec3 uBottomColor;
  uniform float uExponent;
  varying vec3 vLocalDir;

  void main() {
    float h = clamp(normalize(vLocalDir).y, 0.0, 1.0);
    float factor = pow(h, uExponent);
    vec3 col = mix(uBottomColor, uTopColor, factor);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * Menghitung interpolasi nilai visual antara dua fase (tanpa alokasi memori per frame)
 */
function getBlendedVisualConfig(
  fromPhase: TimePhase,
  toPhase: TimePhase,
  blendFactor: number
) {
  const from = TIME_OF_DAY_CONFIG.visuals[fromPhase];
  const to = TIME_OF_DAY_CONFIG.visuals[toPhase];
  const t = Math.max(0, Math.min(1, blendFactor));

  // Lerp warna menggunakan scratch color yang sudah dialokasikan
  _scratchColorA.set(from.skyTopColor);
  _scratchColorB.set(to.skyTopColor);
  _blendedSkyTop.copy(_scratchColorA).lerp(_scratchColorB, t);

  _scratchColorA.set(from.skyBottomColor);
  _scratchColorB.set(to.skyBottomColor);
  _blendedSkyBottom.copy(_scratchColorA).lerp(_scratchColorB, t);

  _scratchColorA.set(from.celestialColor);
  _scratchColorB.set(to.celestialColor);
  _blendedCelestialColor.copy(_scratchColorA).lerp(_scratchColorB, t);

  _scratchColorA.set(from.ambientColor);
  _scratchColorB.set(to.ambientColor);
  _blendedAmbientColor.copy(_scratchColorA).lerp(_scratchColorB, t);

  _scratchColorA.set(from.fogColor);
  _scratchColorB.set(to.fogColor);
  _blendedFogColor.copy(_scratchColorA).lerp(_scratchColorB, t);

  _scratchColorA.set(from.dustColor);
  _scratchColorB.set(to.dustColor);
  _blendedDustColor.copy(_scratchColorA).lerp(_scratchColorB, t);

  _scratchColorA.set(from.lampColor);
  _scratchColorB.set(to.lampColor);
  _blendedLampColor.copy(_scratchColorA).lerp(_scratchColorB, t);

  _scratchColorA.set(from.lampEmissiveColor);
  _scratchColorB.set(to.lampEmissiveColor);
  _blendedLampEmissiveColor.copy(_scratchColorA).lerp(_scratchColorB, t);

  // Lerp skalar
  const lerpNum = (a: number, b: number) => a + (b - a) * t;

  return {
    skyTop: _blendedSkyTop,
    skyBottom: _blendedSkyBottom,
    skyExponent: lerpNum(from.skyExponent, to.skyExponent),
    celestialColor: _blendedCelestialColor,
    celestialIntensity: lerpNum(from.celestialIntensity, to.celestialIntensity),
    ambientColor: _blendedAmbientColor,
    ambientIntensity: lerpNum(from.ambientIntensity, to.ambientIntensity),
    fogColor: _blendedFogColor,
    fogDensity: lerpNum(from.fogDensity, to.fogDensity),
    starsOpacity: lerpNum(from.starsOpacity, to.starsOpacity),
    dustColor: _blendedDustColor,
    dustOpacity: lerpNum(from.dustOpacity, to.dustOpacity),
    lampColor: _blendedLampColor,
    lampIntensity: lerpNum(from.lampIntensity, to.lampIntensity),
    lampEmissiveColor: _blendedLampEmissiveColor,
    lampEmissiveIntensity: lerpNum(from.lampEmissiveIntensity, to.lampEmissiveIntensity),
  };
}

/**
 * Menghitung koordinat posisi matahari dan bulan dari jam desimal (0-24)
 * Menyelaraskan terbit (sunriseHour) dan terbenam (sunsetHour) dari konfigurasi
 */
export function calculateCelestialPositions(
  hour: number,
  radius: number = TIME_OF_DAY_CONFIG.celestialOrbitRadius,
  sunrise: number = TIME_OF_DAY_CONFIG.sunriseHour,
  sunset: number = TIME_OF_DAY_CONFIG.sunsetHour
) {
  let h = hour % 24;
  if (h < 0) h += 24;

  let sunX = 0;
  let sunY = 0;
  let sunZ = 0;
  let moonX = 0;
  let moonY = 0;
  let moonZ = 0;

  // Kemiringan inklinasi orbit agar menyinari permukaan vertikal
  const tiltZ = radius * 0.35;

  if (h >= sunrise && h <= sunset) {
    // Siang hari: matahari berada di atas horizon (Y >= 0)
    const dayDuration = sunset - sunrise;
    const progress = (h - sunrise) / dayDuration; // 0.0 di sunrise, 1.0 di sunset
    const angle = progress * Math.PI; // 0 sampai PI

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    sunX = radius * cosA;
    sunY = radius * sinA;
    sunZ = tiltZ * sinA + radius * 0.22 * cosA;

    // Bulan berada di bawah horizon saat siang
    moonX = -sunX;
    moonY = -sunY;
    moonZ = -sunZ;
  } else {
    // Malam hari: matahari berada di bawah horizon (Y <= 0), bulan di atas horizon (Y >= 0)
    const nightDuration = 24 - sunset + sunrise;
    const elapsed = h > sunset ? h - sunset : 24 - sunset + h;
    const progress = elapsed / nightDuration;
    const angle = progress * Math.PI;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Matahari di bawah horizon
    sunX = -radius * cosA;
    sunY = -radius * sinA;
    sunZ = -tiltZ * sinA - radius * 0.22 * cosA;

    // Bulan di atas horizon melintasi langit malam dari timur ke barat
    moonX = radius * cosA;
    moonY = radius * sinA;
    moonZ = tiltZ * sinA + radius * 0.22 * cosA;
  }

  return {
    sun: [sunX, sunY, sunZ] as [number, number, number],
    moon: [moonX, moonY, moonZ] as [number, number, number],
    sunElevation: sunY / radius,
    moonElevation: moonY / radius,
  };
}

/**
 * Komponen Lampu Lorong / Interior Liminal
 */
export interface LiminalLampProps {
  position?: [number, number, number];
  intensityMultiplier?: number;
  fixtureScale?: number;
}

export const LiminalLamp: React.FC<LiminalLampProps> = ({
  position = [0, 3, 0],
  intensityMultiplier = 1.0,
  fixtureScale = 1.0,
}) => {
  const pointLightRef = useRef<THREE.PointLight>(null);
  const tubeMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // Variabel flicker internal per lampu
  const flickerTimer = useRef(0);
  const flickerDuration = useRef(0);
  const flickerDip = useRef(0);

  // Baca state langsung lewat getState() di useFrame tanpa memicu re-render hook
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const damping = 1 - Math.exp(-TIME_OF_DAY_CONFIG.dampingLambda * dt);

    const { activePhase, nextPhase, blendFactor, prefersReducedMotion } =
      useTimeOfDayStore.getState();

    const blended = getBlendedVisualConfig(activePhase, nextPhase, blendFactor);

    // Hitung flicker acak jika gerakan tidak dikurangi
    let flickerFactor = 1.0;
    if (!prefersReducedMotion) {
      flickerTimer.current += dt;
      if (flickerTimer.current > 0.05) {
        flickerTimer.current = 0;
        if (Math.random() < TIME_OF_DAY_CONFIG.liminalLamp.flickerProbability) {
          flickerDuration.current = 0.06 + Math.random() * 0.08;
          flickerDip.current = 0.25 + Math.random() * 0.45;
        }
      }

      if (flickerDuration.current > 0) {
        flickerDuration.current -= dt;
        flickerFactor = 1.0 - flickerDip.current;
      }
    }

    const targetIntensity = blended.lampIntensity * intensityMultiplier * flickerFactor;
    const targetEmissive = blended.lampEmissiveIntensity * flickerFactor;

    if (pointLightRef.current) {
      pointLightRef.current.intensity = THREE.MathUtils.damp(
        pointLightRef.current.intensity,
        targetIntensity,
        TIME_OF_DAY_CONFIG.dampingLambda,
        dt
      );
      pointLightRef.current.color.lerp(blended.lampColor, damping);
    }

    if (tubeMatRef.current) {
      tubeMatRef.current.emissive.lerp(blended.lampEmissiveColor, damping);
      tubeMatRef.current.emissiveIntensity = THREE.MathUtils.damp(
        tubeMatRef.current.emissiveIntensity,
        targetEmissive,
        TIME_OF_DAY_CONFIG.dampingLambda,
        dt
      );
    }
  });

  return (
    <group position={position} scale={fixtureScale}>
      {/* Rumah casing lampu industri liminal */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.4, 0.06, 0.28]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.8} metalness={0.4} />
      </mesh>

      {/* Tabung neon fluorescent */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.28, 0.04, 0.18]} />
        <meshStandardMaterial
          ref={tubeMatRef}
          color="#ffffff"
          roughness={0.2}
          emissive="#F2C200"
          emissiveIntensity={2.0}
        />
      </mesh>

      {/* Titik cahaya tanpa shadow untuk mempertahankan performa */}
      <pointLight
        ref={pointLightRef}
        position={[0, -0.15, 0]}
        distance={14}
        decay={2}
        intensity={2.5}
        color="#F2C200"
        castShadow={false}
      />
    </group>
  );
};

/**
 * Komponen Utama Lingkungan Waktu Realtime
 */
export const TimeOfDayEnvironment: React.FC = () => {
  const { scene, camera, gl } = useThree();

  // Referensi komponen Three.js
  const skyGroupRef = useRef<THREE.Group>(null);
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const skyMatRef = useRef<THREE.ShaderMaterial>(null);
  const sunMeshRef = useRef<THREE.Mesh>(null);
  const moonMeshRef = useRef<THREE.Mesh>(null);
  const starsPointsRef = useRef<THREE.Points>(null);
  const starsMatRef = useRef<THREE.PointsMaterial>(null);
  const dustPointsRef = useRef<THREE.Points>(null);
  const dustMatRef = useRef<THREE.PointsMaterial>(null);

  // Timer per detik untuk jam sistem
  useEffect(() => {
    const interval = setInterval(() => {
      useTimeOfDayStore.getState().tickSystemTime();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listener prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => {
      useTimeOfDayStore.getState().setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Pasang kabut atmosfer & RoomEnvironment IBL halus di scene
  useEffect(() => {
    // Paksa store membaca ulang jam sistem terkini agar fase aktif akurat
    useTimeOfDayStore.getState().tickSystemTime();
    if (useTimeOfDayStore.getState().timeSource === 'system') {
      useTimeOfDayStore.getState().useSystemTime();
    }

    const { activePhase, nextPhase, blendFactor } = useTimeOfDayStore.getState();
    const initialConfig = getBlendedVisualConfig(activePhase, nextPhase, blendFactor);
    const fog = new THREE.FogExp2(initialConfig.fogColor.clone(), initialConfig.fogDensity);
    scene.fog = fog;

    const pmremGenerator = new THREE.PMREMGenerator(gl);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    if ('environmentIntensity' in scene) {
      scene.environmentIntensity = Math.max(0.05, Math.min(0.42, initialConfig.celestialIntensity * 0.12));
    }

    // Inisialisasi posisi cahaya & bintang sesuai fase aktif agar frame pertama tidak gelap/berbintang di pagi
    if (ambientLightRef.current) {
      ambientLightRef.current.color.copy(initialConfig.ambientColor);
      ambientLightRef.current.intensity = initialConfig.ambientIntensity * 0.6;
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.color.copy(initialConfig.skyBottom);
      hemiLightRef.current.groundColor.copy(initialConfig.ambientColor);
      hemiLightRef.current.intensity = initialConfig.ambientIntensity * 0.72;
    }
    if (starsMatRef.current && starsPointsRef.current) {
      starsMatRef.current.opacity = initialConfig.starsOpacity;
      starsPointsRef.current.visible = initialConfig.starsOpacity > 0.02;
    }

    // Langsung set sky shader ke warna yang benar (tanpa menunggu damping lerp)
    if (skyMatRef.current) {
      (skyMatRef.current.uniforms.uTopColor.value as THREE.Color).copy(initialConfig.skyTop);
      (skyMatRef.current.uniforms.uBottomColor.value as THREE.Color).copy(initialConfig.skyBottom);
      skyMatRef.current.uniforms.uExponent.value = initialConfig.skyExponent;
    }

    // Langsung set directional light ke posisi dan warna yang benar
    if (dirLightRef.current) {
      const celestial = calculateCelestialPositions(
        useTimeOfDayStore.getState().currentHour,
        TIME_OF_DAY_CONFIG.celestialOrbitRadius
      );
      _sunPos.set(celestial.sun[0], celestial.sun[1], celestial.sun[2]);
      _moonPos.set(celestial.moon[0], celestial.moon[1], celestial.moon[2]);

      const activeDir = _sunPos.y >= -5 ? _sunPos.clone().normalize() : _moonPos.clone().normalize();
      _currentLightDir.copy(activeDir);

      const lightRadius = TIME_OF_DAY_CONFIG.celestialOrbitRadius;
      dirLightRef.current.position.set(
        activeDir.x * lightRadius,
        Math.max(18, activeDir.y * lightRadius),
        activeDir.z * lightRadius
      );
      dirLightRef.current.color.copy(initialConfig.celestialColor);
      dirLightRef.current.intensity = initialConfig.celestialIntensity;
    }

    return () => {
      scene.fog = null;
      scene.environment = null;
      roomEnv.dispose();
      envTarget.dispose();
      pmremGenerator.dispose();
    };
  }, [scene, gl]);

  // Inisialisasi geometri bintang di kubah langit atas
  const { starsGeometry } = useMemo(() => {
    const count = 450;
    const positions = new Float32Array(count * 3);
    const radius = 620;

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0) * 0.45;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = Math.max(10, radius * Math.cos(phi));
      const z = radius * Math.sin(phi) * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { starsGeometry: geo, starsCount: count };
  }, []);

  // Inisialisasi geometri partikel debu udara
  const { dustGeometry, dustVelocities, dustCount } = useMemo(() => {
    const count = 160;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = 0.5 + Math.random() * 6.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 36;

      velocities[i * 3] = (Math.random() - 0.5) * 0.08;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.04;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { dustGeometry: geo, dustVelocities: velocities, dustCount: count };
  }, []);

  // Material kubah langit dibuat SEKALI (tanpa dependensi re-instansiasi)
  const skyMaterial = useMemo(() => {
    // Pastikan store membaca jam sistem terbaru sebelum membuat material
    if (typeof window !== 'undefined') {
      useTimeOfDayStore.getState().useSystemTime();
    }
    const { activePhase, nextPhase, blendFactor } = useTimeOfDayStore.getState();
    const init = getBlendedVisualConfig(activePhase, nextPhase, blendFactor);
    return new THREE.ShaderMaterial({
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
      uniforms: {
        uTopColor: { value: init.skyTop.clone() },
        uBottomColor: { value: init.skyBottom.clone() },
        uExponent: { value: init.skyExponent },
      },
      side: THREE.BackSide,
      depthWrite: false,
      fog: false, // Bebas dari kabut agar warna langit selalu presisi
    });
  }, []);

  // Bersihkan resource saat unmount
  useEffect(() => {
    return () => {
      starsGeometry.dispose();
      dustGeometry.dispose();
      skyMaterial.dispose();
    };
  }, [starsGeometry, dustGeometry, skyMaterial]);

  // Perulangan animasi per-frame (useFrame) membaca getState() tanpa memicu React re-render
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const damping = 1 - Math.exp(-TIME_OF_DAY_CONFIG.dampingLambda * dt);

    const { currentHour, activePhase, nextPhase, blendFactor, prefersReducedMotion } =
      useTimeOfDayStore.getState();

    // Hitung konfigurasi interpolasi fase
    const blended = getBlendedVisualConfig(activePhase, nextPhase, blendFactor);

    // Posisi kamera pemain (Ikuti pemain secara horizontal di X & Z)
    const camX = camera.position.x;
    const camZ = camera.position.z;

    if (skyGroupRef.current) {
      skyGroupRef.current.position.set(camX, 0, camZ);
    }

    // 1. Update Posisi Matahari & Bulan
    const celestial = calculateCelestialPositions(
      currentHour,
      TIME_OF_DAY_CONFIG.celestialOrbitRadius
    );
    _sunPos.set(celestial.sun[0], celestial.sun[1], celestial.sun[2]);
    _moonPos.set(celestial.moon[0], celestial.moon[1], celestial.moon[2]);

    if (sunMeshRef.current) {
      sunMeshRef.current.position.copy(_sunPos);
      sunMeshRef.current.visible = _sunPos.y > -15;
    }
    if (moonMeshRef.current) {
      moonMeshRef.current.position.copy(_moonPos);
      moonMeshRef.current.visible = _moonPos.y > -15;
    }

    // 2. Arah Directional Light: Interpolasi ARAH (vektor ternormalisasi dikalikan radius)
    _sunDir.copy(_sunPos).normalize();
    _moonDir.copy(_moonPos).normalize();

    if (_sunPos.y >= -5) {
      _activeCelestialDir.copy(_sunDir);
    } else {
      _activeCelestialDir.copy(_moonDir);
    }

    // Interpolasi nlerp arah agar tidak melintasi titik pusat (zero flickering)
    _currentLightDir.lerp(_activeCelestialDir, damping).normalize();

    const lightRadius = TIME_OF_DAY_CONFIG.celestialOrbitRadius;
    const targetX = THREE.MathUtils.clamp(camX, -18, 18);
    const targetZ = THREE.MathUtils.clamp(camZ, -18, 18);
    const lightX = targetX + _currentLightDir.x * lightRadius;
    const lightY = Math.max(18, _currentLightDir.y * lightRadius);
    const lightZ = targetZ + _currentLightDir.z * lightRadius;

    if (dirLightRef.current) {
      dirLightRef.current.position.set(lightX, lightY, lightZ);
      dirLightRef.current.target.position.set(targetX, -2, targetZ);
      dirLightRef.current.target.updateMatrixWorld();
      dirLightRef.current.color.lerp(blended.celestialColor, damping);
      dirLightRef.current.intensity = THREE.MathUtils.damp(
        dirLightRef.current.intensity,
        blended.celestialIntensity,
        TIME_OF_DAY_CONFIG.dampingLambda,
        dt
      );
    }

    // 3. Cahaya Ambien, IBL halus, & pantulan langit-tanah tanpa mengubah palet fase
    if ('environmentIntensity' in scene) {
      const targetEnv = THREE.MathUtils.clamp(blended.celestialIntensity * 0.12, 0.05, 0.42);
      scene.environmentIntensity = THREE.MathUtils.damp(
        scene.environmentIntensity ?? targetEnv,
        targetEnv,
        TIME_OF_DAY_CONFIG.dampingLambda,
        dt
      );
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.color.lerp(blended.ambientColor, damping);
      ambientLightRef.current.intensity = THREE.MathUtils.damp(
        ambientLightRef.current.intensity,
        blended.ambientIntensity * 0.6,
        TIME_OF_DAY_CONFIG.dampingLambda,
        dt
      );
    }

    if (hemiLightRef.current) {
      hemiLightRef.current.color.lerp(blended.skyBottom, damping);
      hemiLightRef.current.groundColor.lerp(blended.ambientColor, damping);
      hemiLightRef.current.intensity = THREE.MathUtils.damp(
        hemiLightRef.current.intensity,
        blended.ambientIntensity * 0.72,
        TIME_OF_DAY_CONFIG.dampingLambda,
        dt
      );
    }

    // 4. Kubah Langit
    if (skyMatRef.current) {
      (skyMatRef.current.uniforms.uTopColor.value as THREE.Color).lerp(blended.skyTop, damping);
      (skyMatRef.current.uniforms.uBottomColor.value as THREE.Color).lerp(blended.skyBottom, damping);
      skyMatRef.current.uniforms.uExponent.value = THREE.MathUtils.damp(
        skyMatRef.current.uniforms.uExponent.value,
        blended.skyExponent,
        TIME_OF_DAY_CONFIG.dampingLambda,
        dt
      );
    }

    // 5. Kabut Atmosfer
    if (scene.fog && scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.lerp(blended.fogColor, damping);
      scene.fog.density = THREE.MathUtils.damp(
        scene.fog.density,
        blended.fogDensity,
        TIME_OF_DAY_CONFIG.dampingLambda,
        dt
      );
    }

    // 6. Bintang Malam (matikan mesh sepenuhnya saat siang/pagi)
    if (starsMatRef.current) {
      starsMatRef.current.opacity = THREE.MathUtils.damp(
        starsMatRef.current.opacity,
        blended.starsOpacity,
        TIME_OF_DAY_CONFIG.dampingLambda,
        dt
      );
      if (starsPointsRef.current) {
        starsPointsRef.current.visible = starsMatRef.current.opacity > 0.02;
      }
    }

    // 7. Partikel Debu Udara (berpusat di sekitar pemain)
    if (dustPointsRef.current && dustMatRef.current) {
      dustMatRef.current.color.lerp(blended.dustColor, damping);
      dustMatRef.current.opacity = THREE.MathUtils.damp(
        dustMatRef.current.opacity,
        blended.dustOpacity,
        TIME_OF_DAY_CONFIG.dampingLambda,
        dt
      );

      const motionScale = prefersReducedMotion ? 0.15 : 1.0;
      const positionsAttr = dustPointsRef.current.geometry.attributes.position;
      const posArray = positionsAttr.array as Float32Array;

      for (let i = 0; i < dustCount; i++) {
        const idx = i * 3;
        posArray[idx] += dustVelocities[idx] * motionScale * dt;
        posArray[idx + 1] += dustVelocities[idx + 1] * motionScale * dt;
        posArray[idx + 2] += dustVelocities[idx + 2] * motionScale * dt;

        // Wrap around relatif terhadap pemain
        const relX = posArray[idx] - camX;
        const relZ = posArray[idx + 2] - camZ;

        if (relX < -18) posArray[idx] = camX + 18;
        if (relX > 18) posArray[idx] = camX - 18;
        if (posArray[idx + 1] < 0.2) posArray[idx + 1] = 7.0;
        if (posArray[idx + 1] > 7.0) posArray[idx + 1] = 0.2;
        if (relZ < -18) posArray[idx + 2] = camZ + 18;
        if (relZ > 18) posArray[idx + 2] = camZ - 18;
      }
      positionsAttr.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Group langit & celestial: berpusat mengikuti posisi kamera pemain */}
      <group ref={skyGroupRef}>
        {/* 1. Kubah Langit Berbasis Gradien Ringan (di luar batas medan, fog=false) */}
        <mesh scale={[-1, 1, 1]} renderOrder={-10}>
          <sphereGeometry args={[680, 24, 16]} />
          <primitive object={skyMaterial} ref={skyMatRef} attach="material" />
        </mesh>

        {/* 2. Model Matahari (fog=false) */}
        <mesh ref={sunMeshRef}>
          <sphereGeometry args={[3.2, 16, 16]} />
          <meshBasicMaterial color="#fffbe6" fog={false} />
        </mesh>

        {/* 3. Model Bulan (fog=false) */}
        <mesh ref={moonMeshRef}>
          <sphereGeometry args={[2.4, 16, 16]} />
          <meshBasicMaterial color="#5CE1FF" fog={false} />
        </mesh>

        {/* 4. Taburan Bintang Langit Malam (fog=false) */}
        <points ref={starsPointsRef} geometry={starsGeometry}>
          <pointsMaterial
            ref={starsMatRef}
            size={1.2}
            color="#e6f2ff"
            transparent
            opacity={0}
            depthWrite={false}
            fog={false}
            sizeAttenuation
          />
        </points>
      </group>

      {/* 5. Lapisan Awan Rendah Poligon (SkyClouds) */}
      <SkyClouds count={14} speedMultiplier={1.0} />

      {/* 6. Partikel Debu Udara (Mote) */}
      <points ref={dustPointsRef} geometry={dustGeometry}>
        <pointsMaterial
          ref={dustMatRef}
          size={0.12}
          color="#cad5dc"
          transparent
          opacity={0.15}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* 7. Directional Light Utama (Frustum +-82m mencakup penuh seluruh kawasan kampus) */}
      <directionalLight
        ref={dirLightRef}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={260}
        shadow-camera-left={-82}
        shadow-camera-right={82}
        shadow-camera-top={82}
        shadow-camera-bottom={-82}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
      />

      {/* 8. Cahaya Ambien & Pantulan Langit-Tanah Tanpa Shadow */}
      <ambientLight ref={ambientLightRef} />
      <hemisphereLight ref={hemiLightRef} />
    </>
  );
};
