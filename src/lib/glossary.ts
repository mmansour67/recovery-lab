/**
 * One place for every plain-language definition the UI shows. Keeping these
 * together keeps the voice consistent and stops each screen from inventing
 * its own slightly-different explanation.
 */
export const GLOSSARY = {
  validDays: {
    label: "Valid days",
    definition:
      "Days where everything lined up: you checked in, WHOOP scored that night's sleep, and nothing unusual (travel, illness) got flagged. Only these days count toward your result.",
  },
  daysPerCondition: {
    label: "Days per condition",
    definition:
      "How many valid days landed on habit days versus normal days. The closer to even, the fairer the comparison.",
  },
  checkinRate: {
    label: "Check-in rate",
    definition:
      "The share of days you told us what actually happened. If this drops below about 60%, the result gets shaky no matter what the math says.",
  },
  interval: {
    label: "95% interval",
    definition:
      "The range of effects your data is still consistent with. A wide range means the experiment hasn't narrowed things down much yet. If it includes zero, “no effect at all” is still on the table.",
  },
  adjustedEstimate: {
    label: "Adjusted estimate",
    definition:
      "The same comparison, after accounting for how hard each day was (strain) and day-of-week patterns. When it agrees with the plain estimate, that's a good sign the result isn't an artifact of hard training days or weekends.",
  },
  intervention: {
    label: "Intervention day",
    definition:
      "A day randomly assigned to the habit you're testing. You follow the instruction, and that night's sleep and next morning's recovery get scored against it.",
  },
  control: {
    label: "Control day",
    definition:
      "A day randomly assigned to your normal routine. These days are the baseline your habit days get compared against — without them there's nothing to measure improvement from.",
  },
  effect: {
    label: "Estimated effect",
    definition:
      "Average recovery on habit-assigned days minus average recovery on normal days. Positive means recovery ran higher when the habit was assigned.",
  },
  confidence: {
    label: "Confidence",
    definition:
      "A plain-language read on how much weight the result can hold, based on valid days, balance between conditions, and check-in consistency. It's a product judgment call, not a medical claim.",
  },
  randomized: {
    label: "Randomized",
    definition:
      "Chance decides which days get the habit — not your mood, schedule, or how you slept. That's what keeps the comparison fair.",
  },
} as const;

export type GlossaryTerm = keyof typeof GLOSSARY;
