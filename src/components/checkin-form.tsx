"use client";

import { useActionState, useState } from "react";
import { motion } from "motion/react";
import { submitCheckinAction, type CheckinActionState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const initialState: CheckinActionState = { error: null, success: false };

const ADHERENCE_OPTIONS: { value: "YES" | "PARTIAL" | "NO"; label: string; hint: string }[] = [
  { value: "YES", label: "Yes", hint: "followed it" },
  { value: "PARTIAL", label: "Partly", hint: "some slippage" },
  { value: "NO", label: "No", hint: "didn't happen" },
];

export function CheckinForm({ experimentDayId }: { experimentDayId: string }) {
  const action = submitCheckinAction.bind(null, experimentDayId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [adherence, setAdherence] = useState<string | null>(null);
  const [unusualDay, setUnusualDay] = useState(false);

  if (state.success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-2.5 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3.5 text-sm"
      >
        <span className="text-primary">✓</span> Logged. Honest answers, including &ldquo;no,&rdquo; are
        what keep the result trustworthy.
      </motion.div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm">Did today go according to the card?</Label>
        <div className="grid grid-cols-3 gap-2">
          {ADHERENCE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border px-3 py-3 transition-all",
                adherence === option.value
                  ? "border-primary/60 bg-primary/15 shadow-[0_0_16px_-6px] shadow-primary/40"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <input
                type="radio"
                name="adherence"
                value={option.value}
                required
                className="sr-only"
                checked={adherence === option.value}
                onChange={() => setAdherence(option.value)}
              />
              <span className="text-sm font-medium">{option.label}</span>
              <span className="text-[0.65rem] text-muted-foreground">{option.hint}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="unusualDay"
            className="size-4 accent-[var(--primary)]"
            checked={unusualDay}
            onChange={(e) => setUnusualDay(e.target.checked)}
          />
          Anything unusual today? Travel, illness, a big night out…
        </label>
        {unusualDay && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <input
              type="text"
              name="unusualDayReason"
              placeholder="What happened? (this day gets set aside, not judged)"
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/50"
            />
          </motion.div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm text-muted-foreground">
          Note to self <span className="text-muted-foreground/60">(optional)</span>
        </Label>
        <Textarea id="notes" name="notes" rows={2} placeholder="e.g. slept somewhere new, skipped the run" />
      </div>

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : "Log today"}
      </Button>
    </form>
  );
}
