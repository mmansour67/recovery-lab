import Link from "next/link";
import { format } from "date-fns";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { db } from "@/lib/db";
import { deleteAccountAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Reveal } from "@/components/motion";
import { LiveDot } from "@/components/graphics";

/** Editorial left-rail label for each settings section. */
function SectionRail({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-baseline gap-3 pt-1 sm:flex-col sm:gap-1">
      <span className="font-mono text-xs text-primary/70">{index}</span>
      <span className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  );
}

export default async function SettingsPage() {
  const user = await requireCurrentUser();
  const connection = await db.whoopConnection.findUnique({ where: { userId: user.id } });
  const whoopConnected = Boolean(connection && !connection.revokedAt);

  return (
    <div className="space-y-10">
      {/* Editorial header */}
      <Reveal>
        <header className="space-y-3">
          <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Settings
          </p>
          <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Your account, <span className="italic text-primary">in plain terms</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-mono text-foreground/80">{user.email}</span>
            {user.timezone ? (
              <>
                {" · "}
                <span className="font-mono">{user.timezone}</span>
              </>
            ) : null}
          </p>
        </header>
      </Reveal>

      {/* 01 — Connection */}
      <Reveal delay={0.08}>
        <section className="grid gap-3 sm:grid-cols-[7.5rem_1fr] sm:gap-6">
          <SectionRail index="01" label="Connection" />
          <Card className={whoopConnected ? "card-glow" : undefined}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">WHOOP</CardTitle>
                {whoopConnected ? (
                  <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary">
                    <LiveDot />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline">Not connected</Badge>
                )}
              </div>
              <CardDescription className="max-w-prose leading-relaxed">
                {whoopConnected
                  ? "Read-only access to recovery, sleep, and cycles — that's the whole scope. Disconnecting revokes it immediately. Results and check-ins you've already generated stay put."
                  : "No WHOOP linked right now. Experiments need one — the recovery score is the measurement."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {whoopConnected && connection && (
                <>
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <div className="flex items-baseline justify-between gap-4 sm:flex-col sm:gap-0.5">
                      <span className="text-xs text-muted-foreground">Connected since</span>
                      <span className="font-mono text-foreground/90">
                        {format(connection.connectedAt, "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 sm:flex-col sm:gap-0.5">
                      <span className="text-xs text-muted-foreground">Last sync</span>
                      <span className="font-mono text-foreground/90">
                        {connection.lastSuccessfulSyncAt
                          ? format(connection.lastSuccessfulSyncAt, "MMM d, yyyy · HH:mm")
                          : "none yet"}
                      </span>
                    </div>
                  </div>
                  <Separator />
                </>
              )}
              {whoopConnected ? (
                <form action="/api/whoop/disconnect" method="post">
                  <Button variant="outline" type="submit">
                    Disconnect WHOOP
                  </Button>
                </form>
              ) : (
                <Button render={<a href="/api/whoop/connect">Connect WHOOP</a>} />
              )}
            </CardContent>
          </Card>
        </section>
      </Reveal>

      {/* 02 — Your data */}
      <Reveal delay={0.12}>
        <section className="grid gap-3 sm:grid-cols-[7.5rem_1fr] sm:gap-6">
          <SectionRail index="02" label="Your data" />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What we keep</CardTitle>
              <CardDescription className="max-w-prose leading-relaxed">
                The full inventory, not a summary. Nothing here gets sold or shared.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm">
                <li className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                  <span className="w-32 shrink-0 font-mono text-xs text-primary/80">Account</span>
                  <span className="text-muted-foreground">
                    Your email and timezone. That&apos;s the whole identity record.
                  </span>
                </li>
                <li className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                  <span className="w-32 shrink-0 font-mono text-xs text-primary/80">Experiments</span>
                  <span className="text-muted-foreground">
                    The habits you tested, each day&apos;s assignment, and your nightly check-ins.
                  </span>
                </li>
                <li className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                  <span className="w-32 shrink-0 font-mono text-xs text-primary/80">WHOOP records</span>
                  <span className="text-muted-foreground">
                    Recovery, sleep, and cycle data — only for the days your experiments cover.
                  </span>
                </li>
              </ul>
              <Separator />
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary" render={<a href="/api/account/export">Download a copy (JSON)</a>} />
                <span className="text-xs text-muted-foreground">One file, everything above.</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </Reveal>

      {/* 03 — Danger zone */}
      <Reveal delay={0.16}>
        <section className="grid gap-3 sm:grid-cols-[7.5rem_1fr] sm:gap-6">
          <SectionRail index="03" label="The exit" />
          <Card className="border border-destructive/35 bg-destructive/[0.04] ring-destructive/20">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Delete account</CardTitle>
              <CardDescription className="max-w-prose leading-relaxed">
                Removes everything listed above — account, experiments, check-ins, synced WHOOP data —
                and signs you out. No soft delete, no grace period. If you just want WHOOP unlinked,
                use disconnect instead; it keeps your results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={deleteAccountAction}>
                <Button variant="destructive" type="submit">
                  Delete my account and all data
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </Reveal>

      <Reveal delay={0.2}>
        <p className="text-xs text-muted-foreground">
          Questions about any of this?{" "}
          <Link href="/methodology" className="underline underline-offset-2 hover:text-foreground">
            The methodology page
          </Link>{" "}
          covers how the data actually gets used.
        </p>
      </Reveal>
    </div>
  );
}
