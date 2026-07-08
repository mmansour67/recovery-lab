"use client";

import { useActionState, useState } from "react";
import { createExperimentAction, type NewExperimentActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { InfoTip } from "@/components/info-tip";
import { cn } from "@/lib/utils";

const initialState: NewExperimentActionState = { errors: [] };

const PRESETS = [
  {
    key: "caffeine",
    emoji: "☕️",
    title: "No caffeine after 2 p.m.",
    hypothesis: "Cutting caffeine off at 2 p.m. improves recovery the next morning.",
    interventionInstructions: "No caffeine after 2:00 p.m. today. Morning coffee is fine.",
    controlInstructions: "Drink coffee like you normally would. No changes today.",
  },
  {
    key: "phone",
    emoji: "📵",
    title: "Phone outside the bedroom",
    hypothesis: "Charging the phone outside the bedroom improves recovery the next morning.",
    interventionInstructions: "Tonight the phone charges outside the bedroom. An alarm clock is allowed.",
    controlInstructions: "Keep the phone wherever it usually lives tonight.",
  },
  {
    key: "meditation",
    emoji: "🧘",
    title: "Ten minutes of meditation before bed",
    hypothesis: "Ten quiet minutes before bed improves recovery the next morning.",
    interventionInstructions: "Ten minutes of meditation sometime in the hour before bed.",
    controlInstructions: "Your usual routine before bed, whatever that is tonight.",
  },
  {
    key: "food",
    emoji: "🍽️",
    title: "No food within three hours of bedtime",
    hypothesis: "Finishing dinner earlier improves recovery the next morning.",
    interventionInstructions: "Last bite at least three hours before you plan to sleep.",
    controlInstructions: "Eat on your normal schedule today.",
  },
] as const;

const DURATION_OPTIONS = [14, 18, 28, 42];

function tomorrowDateString(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export default function NewExperimentPage() {
  const [state, formAction, pending] = useActionState(createExperimentAction, initialState);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [duration, setDuration] = useState(18);
  const [fields, setFields] = useState({
    title: "",
    hypothesis: "",
    interventionInstructions: "",
    controlInstructions: "",
  });

  function applyPreset(key: string) {
    const preset = PRESETS.find((p) => p.key === key);
    if (!preset) return;
    setSelectedPreset(key);
    setFields({
      title: preset.title,
      hypothesis: preset.hypothesis,
      interventionInstructions: preset.interventionInstructions,
      controlInstructions: preset.controlInstructions,
    });
  }

  return (
    <div className="space-y-8">
      <Reveal>
        <header className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">New experiment</p>
          <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Design the <span className="italic text-primary">test</span>
          </h1>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            One habit, tested properly. Chance decides which days are habit days. You just follow the card
            and log what happened. Start from a template or write your own.
          </p>
        </header>
      </Reveal>

      {/* Preset picker */}
      <Stagger className="grid gap-3 sm:grid-cols-2" gap={0.07}>
        {PRESETS.map((preset) => (
          <StaggerItem key={preset.key}>
            <button
              type="button"
              onClick={() => applyPreset(preset.key)}
              className={cn(
                "relative h-full w-full rounded-xl border p-4 text-left transition-all",
                selectedPreset === preset.key
                  ? "border-primary/60 bg-primary/10 shadow-[0_0_24px_-8px] shadow-primary/40"
                  : "bg-card hover:bg-muted/60"
              )}
            >
              {selectedPreset === preset.key && (
                <span className="absolute right-3 top-3 text-sm text-primary">✓</span>
              )}
              <span className="text-lg">{preset.emoji}</span>
              <p className="mt-2 text-sm font-medium">{preset.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{preset.hypothesis}</p>
            </button>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">The protocol</CardTitle>
            <CardDescription>
              Whatever you write below is exactly what your daily card will say, so keep it doable on a
              random Tuesday.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="e.g. No caffeine after 2 p.m."
                  value={fields.title}
                  onChange={(e) => setFields({ ...fields, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hypothesis">Hypothesis</Label>
                <Textarea
                  id="hypothesis"
                  name="hypothesis"
                  required
                  rows={2}
                  placeholder="What do you suspect is true?"
                  value={fields.hypothesis}
                  onChange={(e) => setFields({ ...fields, hypothesis: e.target.value })}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="interventionInstructions" className="inline-flex items-center gap-1.5">
                    On habit days <InfoTip term="intervention" />
                  </Label>
                  <Textarea
                    id="interventionInstructions"
                    name="interventionInstructions"
                    required
                    rows={3}
                    value={fields.interventionInstructions}
                    onChange={(e) => setFields({ ...fields, interventionInstructions: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="controlInstructions" className="inline-flex items-center gap-1.5">
                    On normal days <InfoTip term="control" />
                  </Label>
                  <Textarea
                    id="controlInstructions"
                    name="controlInstructions"
                    required
                    rows={3}
                    value={fields.controlInstructions}
                    onChange={(e) => setFields({ ...fields, controlInstructions: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    required
                    defaultValue={tomorrowDateString()}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <input type="hidden" name="durationDays" value={duration} />
                  <div className="grid grid-cols-4 gap-2">
                    {DURATION_OPTIONS.map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setDuration(days)}
                        className={cn(
                          "rounded-lg border px-2 py-2 font-mono text-sm transition-all",
                          duration === days
                            ? "border-primary/60 bg-primary/15"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {days}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Why at least 14 days? Each condition needs enough nights for an average to mean anything.
                Under about 7 per side, one bad night can swing the whole result. Even numbers keep the
                split fair.
              </p>

              {state.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <ul className="list-inside list-disc">
                      {state.errors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" size="lg" disabled={pending}>
                {pending ? "Rolling the schedule…" : "Lock it in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
