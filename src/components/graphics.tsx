/**
 * Decorative, animated graphics. All CSS-driven (keyframes live in
 * globals.css) so they render on the server and cost nothing on the client.
 */

import { cn } from "@/lib/utils";

/** Slow-drifting blurred color orbs. Position behind content with absolute inset-0. */
export function GradientOrbs({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className="absolute -top-24 left-[8%] size-[26rem] rounded-full opacity-60 blur-3xl"
        style={{
          background: "radial-gradient(circle, oklch(0.73 0.16 38 / 0.2), transparent 70%)",
          animation: "drift-a 26s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -top-10 right-[4%] size-[22rem] rounded-full opacity-60 blur-3xl"
        style={{
          background: "radial-gradient(circle, oklch(0.68 0.085 262 / 0.24), transparent 70%)",
          animation: "drift-b 32s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-8rem] left-[38%] size-96 rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, oklch(0.82 0.13 85 / 0.14), transparent 70%)",
          animation: "drift-a 38s ease-in-out infinite reverse",
        }}
      />
    </div>
  );
}

/**
 * A recovery-style waveform that draws itself, holds, and fades — looping.
 * Reads as "live physiological signal" without being a real chart.
 */
export function PulseWave({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 80"
      fill="none"
      aria-hidden
      className={cn("w-full", className)}
      preserveAspectRatio="none"
    >
      <path
        d="M0 44 H70 L92 44 L108 18 L124 62 L140 30 L152 44 H220 L242 44 L258 10 L274 68 L290 26 L302 44 H370 L392 44 L404 32 L416 50 L428 44 H480"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 480,
          animation: "pulse-draw 5.5s cubic-bezier(0.4, 0, 0.2, 1) infinite",
          filter: "drop-shadow(0 0 6px oklch(0.84 0.17 163 / 0.55))",
        }}
      />
    </svg>
  );
}

/** Tiny live-status dot (blinking), for "syncing"/"active" affordances. */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-1.5 rounded-full bg-primary", className)}
      style={{ animation: "blink-dot 2.2s ease-in-out infinite" }}
    />
  );
}

/**
 * A static-but-rich mock of an assignment week for the landing page:
 * seven day-chips with randomized-looking condition colors.
 */
export function WeekStrip({ className }: { className?: string }) {
  const days: { label: string; condition: "habit" | "normal" }[] = [
    { label: "M", condition: "habit" },
    { label: "T", condition: "normal" },
    { label: "W", condition: "normal" },
    { label: "T", condition: "habit" },
    { label: "F", condition: "habit" },
    { label: "S", condition: "normal" },
    { label: "S", condition: "habit" },
  ];

  return (
    <div className={cn("flex gap-1.5", className)} aria-hidden>
      {days.map((day, i) => (
        <span
          key={i}
          className={cn(
            "flex size-7 items-center justify-center rounded-md font-mono text-[0.65rem]",
            day.condition === "habit"
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {day.label}
        </span>
      ))}
    </div>
  );
}
