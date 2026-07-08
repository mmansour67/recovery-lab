"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { submitCheckin } from "@/lib/experiments/submitCheckin";

export interface CheckinActionState {
  error: string | null;
  success: boolean;
}

export async function submitCheckinAction(
  experimentDayId: string,
  _prevState: CheckinActionState,
  formData: FormData
): Promise<CheckinActionState> {
  const user = await requireCurrentUser();

  const adherence = String(formData.get("adherence") ?? "");
  if (adherence !== "YES" && adherence !== "PARTIAL" && adherence !== "NO") {
    return { error: "Please choose whether you followed today's assignment.", success: false };
  }

  const result = await submitCheckin({
    experimentDayId,
    userId: user.id,
    timezone: user.timezone,
    adherence,
    unusualDay: formData.get("unusualDay") === "on",
    unusualDayReason: String(formData.get("unusualDayReason") ?? "") || undefined,
    notes: String(formData.get("notes") ?? "") || undefined,
  });

  if (!result.ok) {
    return { error: result.error, success: false };
  }

  revalidatePath("/dashboard");
  return { error: null, success: true };
}
