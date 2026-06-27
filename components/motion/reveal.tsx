"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/lib/design/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * Velora 3.0 — Reveal (Phase 2C, MO).
 *
 * Scroll-triggered enter animation: children fade + rise into view the first
 * time they cross the viewport. GPU-friendly (opacity + transform only),
 * staggerable via `delay`, and fully reduced-motion safe (renders visible with
 * no animation when the user prefers reduced motion or IntersectionObserver is
 * unavailable). Defaults to revealed on SSR so content is never hidden if JS
 * fails to run.
 */
interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stagger delay in ms. */
  delay?: number;
  /** Animate every time it enters (default: once). */
  once?: boolean;
  as?: "div" | "section" | "li" | "article";
}

export function Reveal({
  delay = 0,
  once = true,
  as = "div",
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            if (once) io.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, once]);

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      className={cn(
        reduced
          ? ""
          : "motion-safe:transition-[opacity,transform] motion-safe:duration-3 motion-safe:ease-emphasized",
        !reduced && !visible && "translate-y-2 opacity-0",
        !reduced && visible && "translate-y-0 opacity-100",
        className,
      )}
      style={{ transitionDelay: reduced ? undefined : `${delay}ms`, ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Staggers its direct children by wrapping each in a Reveal with an increasing
 * delay. Use for lists/grids that should cascade in.
 */
export function Stagger({
  step = 60,
  className,
  children,
}: {
  step?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      {React.Children.map(children, (child, i) => (
        <Reveal delay={i * step} className={className}>
          {child}
        </Reveal>
      ))}
    </>
  );
}
