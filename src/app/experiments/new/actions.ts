"use server";

import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { createExperiment } from "@/lib/experiments/createExperiment";
import { utcMidnightFromDateString } from "@/lib/experiments/timezone";

export interface NewExperimentActionState {
  errors: string[];
}

export async function createExperimentAction(
  _prevState: NewExperimentActionState,
  formData: FormData
): Promise<NewExperimentActionState> {
  const user = await requireCurrentUser();

  const title = String(formData.get("title") ?? "").trim();
  const hypothesis = String(formData.get("hypothesis") ?? "").trim();
  const interventionInstructions = String(formData.get("interventionInstructions") ?? "").trim();
  const controlInstructions = String(formData.get("controlInstructions") ?? "").trim();
  const startDateString = String(formData.get("startDate") ?? "");
  const durationDays = Number(formData.get("durationDays"));

  if (!title || !hypothesis || !interventionInstructions || !controlInstructions || !startDateString) {
    return { errors: ["All fields are required."] };
  }

  const result = await createExperiment({
    userId: user.id,
    title,
    hypothesis,
    interventionInstructions,
    controlInstructions,
    startDate: utcMidnightFromDateString(startDateString),
    durationDays,
  });

  if (!result.ok) {
    return { errors: result.errors };
  }

  redirect(`/experiments/${result.experimentId}`);
}
