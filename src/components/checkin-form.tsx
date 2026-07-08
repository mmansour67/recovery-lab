"use client";

import { useActionState, useState } from "react";
import { submitCheckinAction, type CheckinActionState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const initialState: CheckinActionState = { error: null, success: false };

const ADHERENCE_OPTIONS: { value: "YES" | "PARTIAL" | "NO"; label: string }[] = [
  { value: "YES", label: "Yes, I followed it" },
  { value: "PARTIAL", label: "Partially" },
  { value: "NO", label: "No" },
];

export function CheckinForm({ experimentDayId }: { experimentDayId: string }) {
  const action = submitCheckinAction.bind(null, experimentDayId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [unusualDay, setUnusualDay] = useState(false);

  if (state.success) {
    return (
      <Alert>
        <AlertDescription>Thanks — today&apos;s check-in is saved.</AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label>Did you follow today&apos;s assignment?</Label>
        <div className="flex flex-col gap-2">
          {ADHERENCE_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <input type="radio" name="adherence" value={option.value} required className="h-4 w-4" />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="unusualDay"
            className="h-4 w-4"
            checked={unusualDay}
            onChange={(e) => setUnusualDay(e.target.checked)}
          />
          Was today unusually different? (travel, illness, alcohol, etc.)
        </label>
        {unusualDay && (
          <input
            type="text"
            name="unusualDayReason"
            placeholder="What made today unusual?"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Optional note</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Submit check-in"}
      </Button>
    </form>
  );
}
