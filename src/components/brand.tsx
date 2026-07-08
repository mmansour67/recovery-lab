import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-6 items-center justify-center rounded-md bg-primary/15 text-primary",
        className
      )}
      aria-hidden
    >
      {/* pulse-line mark */}
      <svg viewBox="0 0 24 24" fill="none" className="size-4" strokeWidth={2.2} stroke="currentColor">
        <path d="M2 12h4l3-7 5 14 3-7h5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function BrandWordmark({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 font-semibold tracking-tight", className)}>
      <BrandMark />
      <span>
        Recovery <span className="text-primary">Lab</span>
      </span>
    </Link>
  );
}
