import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EXAMPLE_RESULT =
  'On days assigned to no caffeine after 2 p.m., your next-morning recovery averaged 7.4 points higher than on control days. The estimated range is −1.8 to 16.6 points across 18 valid days. This suggests a possible benefit, but the result remains uncertain.';

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/30">
      <main className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Recovery Lab</h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Run a randomized, honest experiment on one daily habit — using your own WHOOP data — instead of
          guessing whether it actually works.
        </p>

        <div className="flex gap-3">
          <Button size="lg" render={<Link href="/login">Get started</Link>} />
        </div>

        <Card className="mt-8 text-left">
          <CardHeader>
            <CardTitle className="text-base">What a result looks like</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{EXAMPLE_RESULT}</p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Recovery Lab is a general wellness experimentation tool. It does not diagnose, treat, or give
          medical advice.
        </p>
      </main>
    </div>
  );
}
