"use client";

import { useActionState, useState } from "react";
import { createExperimentAction, type NewExperimentActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: NewExperimentActionState = { errors: [] };

const PRESETS = [
  {
    key: "caffeine",
    title: "No caffeine after 2 p.m.",
    hypothesis: "Avoiding afternoon caffeine improves next-morning recovery.",
    interventionInstructions: "Do not consume caffeine after 2:00 p.m.",
    controlInstructions: "Follow your usual caffeine habits.",
  },
  {
    key: "phone",
    title: "Phone outside the bedroom",
    hypothesis: "Keeping your phone out of the bedroom improves next-morning recovery.",
    interventionInstructions: "Keep your phone outside the bedroom overnight.",
    controlInstructions: "Keep your phone in the bedroom as usual.",
  },
  {
    key: "meditation",
    title: "Ten minutes of meditation before bed",
    hypothesis: "A short pre-bed meditation improves next-morning recovery.",
    interventionInstructions: "Meditate for 10 minutes before bed.",
    controlInstructions: "Follow your usual pre-bed routine.",
  },
  {
    key: "food",
    title: "No food within three hours of bedtime",
    hypothesis: "Avoiding late meals improves next-morning recovery.",
    interventionInstructions: "Do not eat within three hours of bedtime.",
    controlInstructions: "Follow your usual eating habits before bed.",
  },
] as const;

const DURATION_OPTIONS = [14, 18, 21, 28, 42];

function tomorrowDateString(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export default function NewExperimentPage() {
  const [state, formAction, pending] = useActionState(createExperimentAction, initialState);
  const [fields, setFields] = useState({
    title: "",
    hypothesis: "",
    interventionInstructions: "",
    controlInstructions: "",
  });

  function applyPreset(key: string | null) {
    const preset = PRESETS.find((p) => p.key === key);
    if (!preset) return;
    setFields({
      title: preset.title,
      hypothesis: preset.hypothesis,
      interventionInstructions: preset.interventionInstructions,
      controlInstructions: preset.controlInstructions,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New experiment</CardTitle>
        <CardDescription>
          Test one habit for 14–42 days. Each day is randomly assigned to the intervention or a control
          condition, so the result reflects chance, not which days felt convenient.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-2">
          <Label>Start from a template (optional)</Label>
          <Select onValueChange={applyPreset}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a habit to test" />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((preset) => (
                <SelectItem key={preset.key} value={preset.key}>
                  {preset.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
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
              value={fields.hypothesis}
              onChange={(e) => setFields({ ...fields, hypothesis: e.target.value })}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="interventionInstructions">Intervention instructions</Label>
              <Textarea
                id="interventionInstructions"
                name="interventionInstructions"
                required
                value={fields.interventionInstructions}
                onChange={(e) => setFields({ ...fields, interventionInstructions: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="controlInstructions">Control instructions</Label>
              <Textarea
                id="controlInstructions"
                name="controlInstructions"
                required
                value={fields.controlInstructions}
                onChange={(e) => setFields({ ...fields, controlInstructions: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" name="startDate" type="date" required defaultValue={tomorrowDateString()} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationDays">Duration</Label>
              <select
                id="durationDays"
                name="durationDays"
                required
                defaultValue={18}
                className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
              >
                {DURATION_OPTIONS.map((days) => (
                  <option key={days} value={days}>
                    {days} days
                  </option>
                ))}
              </select>
            </div>
          </div>

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

          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create experiment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
