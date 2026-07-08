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
          background: "radial-gradient(circle, oklch(0.55 0.14 35 / 0.13), transparent 70%)",
          animation: "drift-a 26s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -top-10 right-[4%] size-[22rem] rounded-full opacity-60 blur-3xl"
        style={{
          background: "radial-gradient(circle, oklch(0.48 0.085 195 / 0.14), transparent 70%)",
          animation: "drift-b 32s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-8rem] left-[38%] size-96 rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, oklch(0.7 0.12 85 / 0.12), transparent 70%)",
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
          filter: "drop-shadow(0 1px 4px oklch(0.55 0.14 35 / 0.35))",
        }}
      />
    </svg>
  );
}

/**
 * A stylized WHOOP strap, gently floating, with the sensor LED pulsing and
 * rippling the way the real device's optical sensor glows. Pure CSS/SVG so
 * it renders on the server and animates for free.
 */
export function WhoopDevice({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative inline-block", className)}
      style={{ animation: "float-y 6.5s ease-in-out infinite" }}
    >
      <svg viewBox="0 0 200 340" fill="none" className="h-full w-auto drop-shadow-xl">
        {/* knit band */}
        <rect x="72" y="8" width="56" height="324" rx="28" fill="oklch(0.48 0.085 195)" />
        <rect x="72" y="8" width="56" height="324" rx="28" fill="url(#knit)" />
        {/* band highlight */}
        <rect x="78" y="8" width="10" height="324" rx="5" fill="white" opacity="0.14" />

        {/* sensor pod */}
        <g>
          <rect x="58" y="118" width="84" height="112" rx="26" fill="oklch(0.22 0.01 260)" />
          <rect x="58" y="118" width="84" height="112" rx="26" fill="url(#podSheen)" />
          {/* pod edge light */}
          <rect
            x="60.5"
            y="120.5"
            width="79"
            height="107"
            rx="23.5"
            stroke="white"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
          {/* clasp notch */}
          <rect x="88" y="128" width="24" height="5" rx="2.5" fill="white" opacity="0.22" />
        </g>

        {/* LED ripple rings */}
        <circle
          cx="100"
          cy="204"
          r="7"
          fill="none"
          stroke="var(--score-high)"
          strokeWidth="2"
          style={{ transformOrigin: "100px 204px", animation: "led-ripple 2.6s ease-out infinite" }}
        />
        <circle
          cx="100"
          cy="204"
          r="7"
          fill="none"
          stroke="var(--score-high)"
          strokeWidth="2"
          style={{
            transformOrigin: "100px 204px",
            animation: "led-ripple 2.6s ease-out infinite",
            animationDelay: "1.3s",
          }}
        />
        {/* LED */}
        <circle
          cx="100"
          cy="204"
          r="6"
          fill="var(--score-high)"
          style={{ animation: "blink-dot 2.6s ease-in-out infinite" }}
        />

        <defs>
          <pattern id="knit" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 4 H8" stroke="black" strokeOpacity="0.12" strokeWidth="1.5" />
            <path d="M4 0 V8" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
          </pattern>
          <linearGradient id="podSheen" x1="58" y1="118" x2="142" y2="230" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="white" stopOpacity="0.22" />
            <stop offset="0.45" stopColor="white" stopOpacity="0.02" />
            <stop offset="1" stopColor="black" stopOpacity="0.25" />
          </linearGradient>
        </defs>
      </svg>
    </div>
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
