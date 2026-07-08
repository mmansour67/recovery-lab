/**
 * One place for every plain language definition the UI shows. Keeping these
 * together keeps the voice consistent and stops each screen from inventing
 * its own slightly different explanation.
 *
 * House style: write like you'd explain it to a friend at the gym. No
 * hyphens or dashes anywhere, short sentences, no jargon without a picture.
 */
export const GLOSSARY = {
  validDays: {
    label: "Valid days",
    definition:
      "Days where everything lined up. You logged what happened, WHOOP scored that night, and you didn't flag anything weird like travel or illness. Only these days count toward your result.",
  },
  daysPerCondition: {
    label: "Days per condition",
    definition:
      "How many valid days landed on habit days versus normal days. The closer to even, the fairer the comparison.",
  },
  checkinRate: {
    label: "Days you logged",
    definition:
      "The share of days you told us what actually happened. If this slips below about 60 percent, the result gets shaky no matter what the math says.",
  },
  interval: {
    label: "95% interval",
    definition:
      "The range of effects your data still agrees with. A wide range means the experiment hasn't narrowed things down much yet. If the range includes zero, then no effect at all is still a live possibility.",
  },
  adjustedEstimate: {
    label: "Adjusted estimate",
    definition:
      "The same comparison after accounting for how hard each day was and for weekly patterns. When it agrees with the plain estimate, your result probably isn't a workout schedule or a weekend in disguise.",
  },
  intervention: {
    label: "Habit day",
    definition:
      "A day that chance assigned to the habit you're testing. You follow the card, then that night's sleep and the next morning's recovery get scored against it.",
  },
  control: {
    label: "Normal day",
    definition:
      "A day that chance assigned to your usual routine. These days are the baseline. Without them there would be nothing to compare the habit against.",
  },
  effect: {
    label: "Estimated effect",
    definition:
      "Average recovery on habit days minus average recovery on normal days. Positive means recovery ran higher when the habit was assigned.",
  },
  confidence: {
    label: "Confidence",
    definition:
      "A plain read on how much weight the result can hold, based on valid days, balance between conditions, and how consistently you logged. It's our judgment call as a product, not a medical claim.",
  },
  randomized: {
    label: "Randomized",
    definition:
      "Chance decides which days get the habit. Not your mood, not your calendar, not how you slept. That's what keeps the comparison honest.",
  },
} as const;

export type GlossaryTerm = keyof typeof GLOSSARY;
