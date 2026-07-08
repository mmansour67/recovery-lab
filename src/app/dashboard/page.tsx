import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { db } from "@/lib/db";
import { getTodayAssignment } from "@/lib/experiments/getTodayAssignment";
import { localDateString, utcMidnightFromDateString } from "@/lib/experiments/timezone";
import { DailyAssignment } from "@/components/daily-assignment";
import { ExperimentCard } from "@/components/experiment-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientOrbs, LiveDot, PulseWave, WeekStrip } from "@/components/graphics";
import { AnimatedBar, Reveal } from "@/components/motion";
import { InfoTip } from "@/components/info-tip";

const PRESET_CHIPS = [
  "No caffeine after 2 p.m.",
  "Phone outside the bedroom",
  "10 min meditation before bed",
  "No food 3h before bed",
];

export default async function DashboardPage() {
  const user = await requireCurrentUser();

  const [whoopConnection, activeExperiment, pastExperiments] = await Promise.all([
    db.whoopConnection.findUnique({ where: { userId: user.id } }),
    db.experiment.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
      include: { experimentDays: { include: { checkin: true } } },
    }),
    db.experiment.findMany({
      where: { userId: user.id, status: { in: ["COMPLETED", "ABANDONED"] } },
      orderBy: { endDate: "desc" },
      take: 5,
    }),
  ]);

  const whoopConnected = Boolean(whoopConnection && !whoopConnection.revokedAt);

  if (!whoopConnected) {
    return (
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-2xl">
          <GradientOrbs />
          <Card className="glass card-glow relative">
            <CardHeader>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Step one</p>
              <CardTitle className="font-display text-3xl tracking-tight">
                Wire up the <span className="italic text-primary">measurement</span>
              </CardTitle>
              <CardDescription className="max-w-prose leading-relaxed">
                Your WHOOP recovery score is what the experiment measures. Recovery Lab asks for read-only
                access to three things, and nothing else:
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-6">
              <ul className="grid gap-2.5 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-primary/80 pt-0.5 w-20 shrink-0">recovery</span>
                  score, HRV, resting heart rate — the outcome being tested
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-primary/80 pt-0.5 w-20 shrink-0">sleep</span>
                  timing and performance — to match each night to the right day
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-primary/80 pt-0.5 w-20 shrink-0">strain</span>
                  daily load — so a brutal workout doesn&apos;t masquerade as a bad habit
                </li>
              </ul>
              <PulseWave className="h-9 w-full max-w-sm opacity-50" />
              <Button size="lg" render={<Link href="/api/whoop/connect">Connect WHOOP</Link>} />
            </CardContent>
          </Card>
        </div>
      </Reveal>
    );
  }

  if (!activeExperiment) {
    return (
      <div className="space-y-8">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-2xl">
            <GradientOrbs />
            <Card className="glass card-glow relative">
              <CardHeader>
                <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
                  <LiveDot /> WHOOP connected
                </p>
                <CardTitle className="font-display text-3xl tracking-tight">
                  Pick your first <span className="italic text-primary">hypothesis</span>
                </CardTitle>
                <CardDescription className="max-w-prose leading-relaxed">
                  One habit, 14–42 days. Chance splits the days between habit and normal, your recovery does
                  the scoring, and at the end you get a number you can actually stand behind.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-start gap-6">
                <div className="flex flex-wrap gap-2">
                  {PRESET_CHIPS.map((chip) => (
                    <Badge key={chip} variant="secondary" className="py-1 font-normal">
                      {chip}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <WeekStrip />
                  <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    what a randomized week looks like <InfoTip term="randomized" />
                  </p>
                </div>
                <Button size="lg" render={<Link href="/experiments/new">Design the experiment</Link>} />
              </CardContent>
            </Card>
          </div>
        </Reveal>

        {pastExperiments.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Past experiments
            </h2>
            {pastExperiments.map((experiment) => (
              <ExperimentCard key={experiment.id} experiment={experiment} />
            ))}
          </section>
        )}
      </div>
    );
  }

  const assignment = await getTodayAssignment(user.id, user.timezone);

  const totalDays = activeExperiment.experimentDays.length;
  const today = utcMidnightFromDateString(localDateString(new Date(), user.timezone));
  const dayNumber = Math.min(
    Math.max(differenceInCalendarDays(today, activeExperiment.startDate) + 1, 0),
    totalDays
  );
  const progressPercent = totalDays === 0 ? 0 : Math.round((dayNumber / totalDays) * 100);

  const elapsedDays = activeExperiment.experimentDays.filter((d) => d.localDate <= today);
  const checkedInCount = elapsedDays.filter((d) => d.checkin).length;

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <Reveal>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="font-display text-2xl tracking-tight">{activeExperiment.title}</CardTitle>
              <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary">
                <LiveDot /> Active
              </Badge>
            </div>
            <CardDescription>{activeExperiment.hypothesis}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatedBar
              percent={progressPercent}
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              barClassName="h-full rounded-full bg-primary"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <span className="font-mono">
                day {dayNumber} <span className="text-muted-foreground/60">/ {totalDays}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono">
                {checkedInCount}/{elapsedDays.length} check-ins
                <InfoTip term="checkinRate" />
              </span>
              <Button
                variant="secondary"
                size="sm"
                render={<Link href={`/experiments/${activeExperiment.id}`}>View the report</Link>}
              />
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {assignment ? (
        <Reveal delay={0.1}>
          <DailyAssignment assignment={assignment} />
        </Reveal>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nothing assigned for today — the experiment either hasn&apos;t started yet or just wrapped. Check
            the report for where things stand.
          </CardContent>
        </Card>
      )}

      {pastExperiments.length > 0 && (
        <section className="space-y-3 pt-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Past experiments
          </h2>
          {pastExperiments.map((experiment) => (
            <ExperimentCard key={experiment.id} experiment={experiment} />
          ))}
        </section>
      )}
    </div>
  );
}
