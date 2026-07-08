import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandWordmark } from "@/components/brand";
import { GradientOrbs, PulseWave, WeekStrip, LiveDot } from "@/components/graphics";
import { Reveal, Stagger, StaggerItem, SignedCountUp } from "@/components/motion";
import { InfoTip } from "@/components/info-tip";

const STEPS = [
  {
    number: "01",
    title: "Link your WHOOP",
    body: "Read-only. Recovery, sleep, and strain — the three numbers the analysis needs. Disconnect whenever you like.",
  },
  {
    number: "02",
    title: "Follow today's card",
    body: "Each morning you get one instruction: habit day or normal day. Chance picks which, and you never see tomorrow's — so you can't plan around it.",
  },
  {
    number: "03",
    title: "Read the verdict",
    body: "A number, a range, and how much weight it can hold. Sometimes the verdict is “too early to tell.” We'll say that too.",
  },
];

const TRUST = [
  {
    title: "Chance runs the schedule",
    body: "You don't pick which days are habit days — a seeded random draw does. That's the difference between an experiment and a diary.",
  },
  {
    title: "The uncertainty is the headline",
    body: "Every estimate ships with its interval and its valid-day count. If the range still includes zero, the app says so instead of rounding up to a success story.",
  },
  {
    title: "It's not a doctor",
    body: "Recovery Lab reports what your data shows about one habit. It doesn't diagnose, treat, or nudge you toward supplements.",
  },
];

export default function Home() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <BrandWordmark />
        <Button variant="outline" size="sm" render={<Link href="/login">Sign in</Link>} />
      </header>

      <main>
        {/* Hero */}
        <section className="mesh-bg relative">
          <GradientOrbs />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-24 pt-16 text-center sm:pt-24">
            <Reveal>
              <Badge variant="outline" className="mb-8 gap-2 border-primary/30 py-1 font-mono text-[0.7rem] text-muted-foreground">
                <LiveDot />
                n = 1 · your data, your experiment
              </Badge>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="max-w-3xl text-balance font-display text-5xl leading-[1.04] tracking-tight sm:text-7xl">
                You think the late coffee is wrecking your recovery.
                <br />
                <span className="italic text-primary">Prove it.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                Recovery Lab turns one habit into a proper randomized experiment. Some days you do it, some
                days you don&apos;t — chance decides which. After a few weeks, your WHOOP data tells you
                whether it actually mattered.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex items-center gap-3">
                <Button size="lg" render={<Link href="/login">Run the experiment</Link>} />
                <Button size="lg" variant="ghost" render={<a href="#how-it-works">See how it works</a>} />
              </div>
            </Reveal>

            {/* Example result card — the product's actual voice */}
            <Reveal delay={0.34} className="mt-16 w-full max-w-2xl">
              <div className="glass card-glow rounded-2xl p-6 text-left shadow-2xl shadow-black/50 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Result · no caffeine after 2 p.m.
                  </p>
                  <span className="inline-flex items-center gap-1.5">
                    <Badge variant="secondary" className="font-mono text-[0.7rem]">18 valid days</Badge>
                    <InfoTip term="validDays" />
                  </span>
                </div>

                <div className="mt-6 flex items-end gap-4">
                  <SignedCountUp
                    value={7.4}
                    className="font-mono text-6xl font-semibold tracking-tight text-primary"
                  />
                  <span className="pb-1.5 text-sm leading-snug text-muted-foreground">
                    points of next-morning recovery,
                    <br />
                    habit days vs. normal days
                  </span>
                </div>

                {/* interval bar */}
                <div className="mt-7">
                  <div className="relative h-2 rounded-full bg-muted">
                    <div className="absolute inset-y-0 left-[22%] right-[8%] rounded-full bg-primary/35" />
                    <div className="absolute -inset-y-0.5 left-[52%] w-1 -translate-x-1/2 rounded-full bg-primary" />
                    <div className="absolute -inset-y-1.5 left-[29%] w-px bg-foreground/30" />
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono text-xs text-muted-foreground">
                    <span>−1.8</span>
                    <span className="inline-flex items-center gap-1.5">
                      95% interval
                      <InfoTip term="interval" />
                    </span>
                    <span>+16.6</span>
                  </div>
                </div>

                <PulseWave className="mt-7 h-10 opacity-60" />

                <p className="mt-5 border-t pt-5 text-sm leading-relaxed text-muted-foreground">
                  Promising — but that range still includes zero, so &ldquo;no effect&rdquo; hasn&apos;t been
                  ruled out. <span className="text-foreground">The app tells you that instead of hiding it.</span>
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">The method</p>
              <h2 className="mt-3 max-w-lg font-display text-3xl leading-tight tracking-tight sm:text-4xl">
                Three steps, <span className="italic">two to four weeks</span>
              </h2>
            </Reveal>
            <Stagger className="mt-12 grid gap-4 sm:grid-cols-3" gap={0.1}>
              {STEPS.map((step) => (
                <StaggerItem key={step.number}>
                  <div className="h-full rounded-xl border bg-card p-6">
                    <span className="font-mono text-sm text-primary">{step.number}</span>
                    <h3 className="mt-3 font-medium">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                    {step.number === "02" && (
                      <div className="mt-5 space-y-2">
                        <WeekStrip />
                        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          a randomized week
                          <InfoTip term="randomized" />
                        </p>
                      </div>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Why trust it */}
        <section className="mesh-bg relative border-t">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <Reveal className="ml-auto max-w-lg text-right">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">The fine print, up front</p>
              <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
                Why trust a result <span className="italic">from an app?</span>
              </h2>
            </Reveal>
            <Stagger className="mt-12 grid gap-10 sm:grid-cols-3" gap={0.1}>
              {TRUST.map((item) => (
                <StaggerItem key={item.title}>
                  <h3 className="font-medium text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t">
          <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
            <Reveal>
              <h2 className="font-display text-3xl leading-tight tracking-tight sm:text-4xl">
                One habit. A few weeks. <span className="italic text-primary">A straight answer.</span>
              </h2>
              <div className="mt-9">
                <Button size="lg" render={<Link href="/login">Start yours tonight</Link>} />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-10 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <p>
            Recovery Lab is a general wellness tool. It doesn&apos;t diagnose, treat, or provide medical
            advice — it just runs the numbers on your habits.
          </p>
          <Link href="/privacy" className="shrink-0 underline-offset-4 hover:underline">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
