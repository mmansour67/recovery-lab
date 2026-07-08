import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandWordmark } from "@/components/brand";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

export const metadata = { title: "Privacy · Recovery Lab" };

const SECTIONS: { index: string; title: string; body: string }[] = [
  {
    index: "01",
    title: "What we store",
    body: "Your email and timezone, the experiments you create, your daily logs, and the WHOOP recovery, sleep, and cycle records needed to score them. WHOOP tokens are encrypted at rest and never show up in logs. That's the whole inventory.",
  },
  {
    index: "02",
    title: "What we read from WHOOP",
    body: "Recovery, sleep, cycles, and your basic profile. Read access only, and only because the analysis needs them. We don't ask for workouts or body measurements, because we don't use them.",
  },
  {
    index: "03",
    title: "What we'll never do",
    body: "Sell your health data. Share it with advertisers. Turn a recovery score into a diagnosis. Recovery Lab reports what your data shows about one habit, then it stops.",
  },
  {
    index: "04",
    title: "Your exits",
    body: "Disconnect WHOOP any time, and we revoke our own API access when you do. Download everything we hold about you as one JSON file. Or delete the account, which permanently removes it all: experiments, daily logs, synced records.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
        <BrandWordmark />
        <Button variant="outline" size="sm" render={<Link href="/login">Sign in</Link>} />
      </header>
      <main className="mesh-bg mx-auto max-w-3xl px-6 pb-24 pt-12">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Privacy</p>
          <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Your data works for <span className="italic text-primary">you</span>, not us
          </h1>
          <p className="mt-5 max-w-prose leading-relaxed text-muted-foreground">
            Recovery Lab exists to answer your questions about your own habits. It doesn&apos;t have a side
            business in your health data. Here&apos;s exactly what the app keeps and why.
          </p>
        </Reveal>

        <Stagger className="mt-14 space-y-12" gap={0.08}>
          {SECTIONS.map((section) => (
            <StaggerItem key={section.index}>
              <section className="grid gap-2 sm:grid-cols-[5rem_1fr] sm:gap-6">
                <span className="font-mono text-sm text-primary/70">{section.index}</span>
                <div>
                  <h2 className="font-medium">{section.title}</h2>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{section.body}</p>
                </div>
              </section>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1}>
          <p className="mt-16 border-t pt-8 text-xs leading-relaxed text-muted-foreground">
            Recovery Lab is a general wellness tool. It does not diagnose, treat, cure, or prevent any
            disease. Questions? The export button in Settings shows you everything we know.
          </p>
        </Reveal>
      </main>
    </div>
  );
}
