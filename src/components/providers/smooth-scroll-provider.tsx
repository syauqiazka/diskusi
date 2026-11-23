"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (target: number | string | HTMLElement, options?: { offset?: number; immediate?: boolean; duration?: number }) => void;
}

const SmoothScrollContext = React.createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: () => {},
});

export function useSmoothScroll() {
  return React.useContext(SmoothScrollContext);
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [lenisInstance, setLenisInstance] = React.useState<Lenis | null>(null);

  React.useEffect(() => {
    // Jangan aktifkan smooth scroll di halaman dunia 3D (/dunia)
    // agar tidak mengganggu kontrol pointer-lock dan kamera FPS/Orbit
    if (pathname?.startsWith("/dunia")) {
      return;
    }

    // Hormati preferensi reduced-motion pengguna
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      autoRaf: false, // Digetarkan via RAF manual untuk presisi
    });

    let rafId: number;
    function onRaf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(onRaf);
    }
    rafId = requestAnimationFrame(onRaf);

    // Pantau perubahan prefers-reduced-motion saat runtime
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    setLenisInstance(lenis);

    return () => {
      cancelAnimationFrame(rafId);
      mediaQuery.removeEventListener("change", handleMotionChange);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, [pathname]);

  // Gulir ke atas secara mulus setiap navigasi halaman baru
  React.useEffect(() => {
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true });
    }
  }, [pathname, lenisInstance]);

  const scrollTo = React.useCallback(
    (target: number | string | HTMLElement, options?: { offset?: number; immediate?: boolean; duration?: number }) => {
      if (lenisInstance) {
        lenisInstance.scrollTo(target, options);
      } else if (typeof window !== "undefined") {
        if (typeof target === "number") {
          window.scrollTo({ top: target, behavior: options?.immediate ? "auto" : "smooth" });
        } else if (typeof target === "string") {
          const el = document.querySelector(target);
          el?.scrollIntoView({ behavior: options?.immediate ? "auto" : "smooth" });
        } else if (target instanceof HTMLElement) {
          target.scrollIntoView({ behavior: options?.immediate ? "auto" : "smooth" });
        }
      }
    },
    [lenisInstance]
  );

  const contextValue = React.useMemo(
    () => ({
      lenis: lenisInstance,
      scrollTo,
    }),
    [lenisInstance, scrollTo]
  );

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

