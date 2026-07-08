"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * An animated recovery gauge in the spirit of WHOOP's recovery ring: the arc
 * sweeps up to the score while the number counts up in the center. Score
 * colors follow WHOOP's own language (green, amber, red) so the number reads
 * instantly to anyone who wears the strap.
 */
export function RecoveryRing({
  score,
  size = 168,
  label = "recovery",
  className,
}: {
  score: number;
  size?: number;
  label?: string;
  className?: string;
}) {
  const clamped = Math.min(Math.max(score, 0), 100);
  const color =
    clamped >= 67 ? "var(--score-high)" : clamped >= 34 ? "var(--score-mid)" : "var(--score-low)";

  const strokeWidth = size * 0.075;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const progress = useMotionValue(0);
  const spring = useSpring(progress, { stiffness: 45, damping: 15 });
  const dashOffset = useTransform(spring, (v) => circumference * (1 - (v / 100) * (clamped / 100)));
  const displayNumber = useTransform(spring, (v) => Math.round((v / 100) * clamped).toString());

  useEffect(() => {
    if (inView) progress.set(100);
  }, [inView, progress]);

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Recovery score ${clamped}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: dashOffset,
            filter: `drop-shadow(0 0 ${size * 0.06}px ${color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-mono font-semibold tracking-tight"
          style={{ fontSize: size * 0.27, color }}
        >
          {displayNumber}
        </motion.span>
        <span
          className="font-mono uppercase tracking-[0.2em] text-muted-foreground"
          style={{ fontSize: Math.max(size * 0.062, 9) }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
