"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CountUp, SignedCountUp, Reveal } from "@/components/motion";
import { InfoTip, StatLabel } from "@/components/info-tip";
import { GLOSSARY } from "@/lib/glossary";
import type { ExperimentResults } from "@/lib/analysis/getExperimentResults";
import { cn } from "@/lib/utils";

function formatSigned(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded >= 0 ? `+${rounded}` : `−${Math.abs(rounded)}`;
}

const CONFIDENCE_LABEL_TEXT: Record<ExperimentResults["confidenceLabel"], string> = {
  INSUFFICIENT: "Too early to call",
  LOW: "A whisper, not a verdict",
  MODERATE: "A real signal, worth finishing",
  HIGHER: "About as solid as n=1 gets",
};

/** Maps the interval onto a 0–100% track that always includes zero. */
function ciGeometry(low: number, high: number, effect: number) {
  const domainMin = Math.min(low, 0);
  const domainMax = Math.max(high, 0);
  const span = domainMax - domainMin || 1;
  const pad = span * 0.08;
  const min = domainMin - pad;
  const total = span + pad * 2;
  const pct = (v: number) => ((v - min) / total) * 100;
  return { left: pct(low), width: pct(high) - pct(low), point: pct(effect), zero: pct(0) };
}

const HOW_TO_READ: { title: string; body: string }[] = [
  {
    title: "What's a “valid day”?",
    body: GLOSSARY.validDays.definition,
  },
  {
    title: "Why show a range instead of one number?",
    body: GLOSSARY.interval.definition,
  },
  {
    title: "What does “adjusted” mean?",
    body: GLOSSARY.adjustedEstimate.definition,
  },
  {
    title: "Why does randomization matter so much?",
    body: GLOSSARY.randomized.definition,
  },
];

export function ResultSummary({ results }: { results: ExperimentResults }) {
  const geometry = ciGeometry(
    results.confidenceIntervalLow,
    results.confidenceIntervalHigh,
    results.unadjustedEffect
  );
  const positive = results.unadjustedEffect >= 0;
  const includesZero =
    results.confidenceIntervalLow <= 0 && results.confidenceIntervalHigh >= 0;

  return (
    <div className="space-y-6">
      {/* Headline result */}
      <Reveal>
        <Card className="card-glow">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="inline-flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Estimated effect <InfoTip term="effect" />
              </CardTitle>
              <span className="inline-flex items-center gap-1.5">
                <Badge variant="outline" className="font-mono text-[0.7rem]">
                  {CONFIDENCE_LABEL_TEXT[results.confidenceLabel]}
                </Badge>
                <InfoTip term="confidence" />
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-wrap items-end gap-4">
              <SignedCountUp
                value={results.unadjustedEffect}
                className={cn(
                  "font-mono text-7xl font-semibold tracking-tight",
                  positive ? "text-primary" : "text-foreground"
                )}
              />
              <span className="pb-2.5 text-sm leading-snug text-muted-foreground">
                points of next-morning recovery,
                <br />
                habit days vs. normal days
              </span>
            </div>

            {/* Confidence interval bar */}
            <div>
              <div className="relative h-2.5 rounded-full bg-muted">
                <motion.div
                  className="absolute inset-y-0 rounded-full bg-primary/35"
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    left: `${geometry.left}%`,
                    width: `${geometry.width}%`,
                    transformOrigin: "left",
                  }}
                />
                <motion.div
                  className="absolute -inset-y-0.5 w-1 -translate-x-1/2 rounded-full bg-primary"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  style={{ left: `${geometry.point}%` }}
                />
                <div
                  className="absolute -inset-y-2 w-px -translate-x-1/2 bg-foreground/30"
                  style={{ left: `${geometry.zero}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>{formatSigned(results.confidenceIntervalLow)}</span>
                <span className="inline-flex items-center gap-1.5">
                  95% interval · the tick is zero <InfoTip term="interval" />
                </span>
                <span>{formatSigned(results.confidenceIntervalHigh)}</span>
              </div>
              {includesZero && results.validDayCount > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  The range still crosses zero — &ldquo;no effect&rdquo; hasn&apos;t been ruled out yet.
                </p>
              )}
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 border-t pt-6 sm:grid-cols-4">
              <div>
                <StatLabel term="validDays" />
                <p className="mt-1 font-mono text-2xl font-medium">
                  <CountUp value={results.validDayCount} decimals={0} />
                </p>
              </div>
              <div>
                <StatLabel term="daysPerCondition" />
                <p className="mt-1 font-mono text-2xl font-medium">
                  {results.interventionDayCount}
                  <span className="text-muted-foreground/60"> / </span>
                  {results.controlDayCount}
                </p>
              </div>
              <div>
                <StatLabel term="checkinRate" />
                <p className="mt-1 font-mono text-2xl font-medium">
                  <CountUp value={results.adherenceRate * 100} decimals={0} suffix="%" />
                </p>
              </div>
              <div>
                <StatLabel term="adjustedEstimate" />
                <p className="mt-1 font-mono text-2xl font-medium">
                  {results.adjustedEffect !== null ? (
                    <SignedCountUp value={results.adjustedEffect} />
                  ) : (
                    <span className="text-muted-foreground/60">—</span>
                  )}
                </p>
              </div>
            </div>

            {/* Plain-language conclusion */}
            <blockquote className="border-l-2 border-primary/50 pl-4 font-display text-xl leading-relaxed tracking-tight">
              {results.narrative}
            </blockquote>
          </CardContent>
        </Card>
      </Reveal>

      {/* Secondary analyses */}
      {(results.adjustedEffect !== null || results.adherenceComparison) && (
        <Reveal delay={0.08}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Second opinions on the same data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              {results.adjustedEffect !== null && (
                <p>
                  <span className="font-medium text-foreground">Adjusted for strain and weekday: </span>
                  {formatSigned(results.adjustedEffect)} points, next to {formatSigned(results.unadjustedEffect)}{" "}
                  unadjusted. When the two agree, it&apos;s less likely the result is really about hard
                  training days or weekends in disguise.
                </p>
              )}
              {results.adherenceComparison && (
                <p>
                  <span className="font-medium text-foreground">By what you actually did: </span>
                  recovery ran {formatSigned(results.adherenceComparison.effect)} points different on days you
                  said you followed the plan. Take this one with salt — you chose which days to follow, so
                  it&apos;s an association, not a randomized comparison.
                </p>
              )}
            </CardContent>
          </Card>
        </Reveal>
      )}

      {/* How to read this */}
      <Reveal delay={0.12}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How to read this report</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion>
              {HOW_TO_READ.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-sm">{item.title}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
