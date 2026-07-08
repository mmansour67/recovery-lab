"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GLOSSARY, type GlossaryTerm } from "@/lib/glossary";
import { cn } from "@/lib/utils";

/**
 * A small ⓘ that explains a stats term in plain language on hover/tap.
 * Usage: <InfoTip term="validDays" /> next to the stat label.
 */
export function InfoTip({ term, className }: { term: GlossaryTerm; className?: string }) {
  const entry = GLOSSARY[term];

  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          "inline-flex size-4 shrink-0 cursor-help items-center justify-center rounded-full",
          "border border-border text-[0.6rem] leading-none text-muted-foreground",
          "transition-colors hover:border-primary/50 hover:text-primary",
          className
        )}
        aria-label={`What does “${entry.label}” mean?`}
      >
        i
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-72 text-pretty px-3 py-2.5 text-xs leading-relaxed">
        <p className="mb-1 font-medium">{entry.label}</p>
        {entry.definition}
      </TooltipContent>
    </Tooltip>
  );
}

/** A stat label with its InfoTip, so screens don't hand-roll the pairing. */
export function StatLabel({ term, className }: { term: GlossaryTerm; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      {GLOSSARY[term].label}
      <InfoTip term={term} />
    </span>
  );
}
