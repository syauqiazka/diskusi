"use client";

import * as React from "react";
import { gsap, isReducedMotion } from "@/lib/animations";

interface GsapAnimateProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

/**
 * Komponen pembungkus untuk animasi fade-up halus pada konten halaman
 */
export function GsapFadeUp({
  children,
  className = "",
  delay = 0,
  duration = 0.55,
}: GsapAnimateProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isReducedMotion() || !ref.current) return;

    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease: "power2.out",
        clearProps: "transform",
      }
    );
  }, [delay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Komponen pembungkus untuk animasi stagger bertingkat pada barisan kartu
 */
export function GsapStagger({
  children,
  className = "",
  stagger = 0.08,
  delay = 0.05,
}: GsapAnimateProps & { stagger?: number }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isReducedMotion() || !containerRef.current) return;

    const items = containerRef.current.children;
    if (items.length === 0) return;

    gsap.fromTo(
      items,
      { opacity: 0, y: 24, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger,
        delay,
        ease: "back.out(1.2)",
        clearProps: "transform",
      }
    );
  }, [stagger, delay]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

/**
 * Komponen pembungkus untuk animasi membal ceria (Toy-like Bouncy Pop)
 */
export function GsapToyPop({
  children,
  className = "",
  delay = 0,
}: GsapAnimateProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isReducedMotion() || !ref.current) return;

    gsap.fromTo(
      ref.current,
      { opacity: 0, scale: 0.88 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.45,
        delay,
        ease: "back.out(1.8)",
        clearProps: "transform",
      }
    );
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Hook untuk animasi pop-up modal membal ala mainan
 */
export function useModalAnimation(isOpen: boolean) {
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    if (isReducedMotion()) return;

    if (backdropRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
    }

    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.9, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 0.38, ease: "back.out(1.6)" }
      );
    }
  }, [isOpen]);

  return { backdropRef, cardRef };
}

