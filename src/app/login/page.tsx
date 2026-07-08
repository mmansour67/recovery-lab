"use client";

import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, signUp, type AuthActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BrandWordmark } from "@/components/brand";
import { GradientOrbs, PulseWave, WeekStrip } from "@/components/graphics";
import { Reveal } from "@/components/motion";
import { InfoTip } from "@/components/info-tip";

const initialState: AuthActionState = { error: null };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const checkEmail = searchParams.get("checkEmail") === "1";
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction, signInPending] = useActionState(signIn, initialState);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, initialState);

  return (
    <div className="mesh-bg relative isolate min-h-screen overflow-hidden">
      <GradientOrbs />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-14 px-6 py-16 lg:min-h-screen lg:grid-cols-[1fr_minmax(0,25rem)] lg:gap-20 lg:py-12">
        {/* Editorial panel */}
        <Reveal className="mx-auto w-full max-w-md text-center lg:mx-0 lg:max-w-none lg:text-left">
          <BrandWordmark className="justify-center lg:justify-start" />

          <h1 className="mt-10 text-balance font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Every good experiment starts with a <span className="italic text-primary">hunch</span>.
          </h1>

          <p className="mt-6 max-w-md text-pretty leading-relaxed text-muted-foreground max-lg:mx-auto">
            Yours might be the afternoon coffee, or the phone on the nightstand. Pick one habit, let
            chance assign the days, and let your WHOOP data do the talking, even when what it says is
            &ldquo;too early to tell.&rdquo;
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 lg:items-start">
            <WeekStrip />
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              One week, randomized
              <InfoTip term="randomized" />
              &middot; the warm days are habit days
            </p>
          </div>

          <PulseWave className="mt-12 h-10 max-w-xs opacity-50 max-lg:mx-auto" />
        </Reveal>

        {/* Auth card */}
        <Reveal delay={0.12} className="mx-auto w-full max-w-sm lg:max-w-none">
          <Card className="glass card-glow shadow-2xl shadow-black/50">
            <CardHeader>
              <CardTitle className="font-display text-2xl tracking-tight">Enter the lab</CardTitle>
              <CardDescription>
                Experiments run one day at a time. Sign in to see today&apos;s assignment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkEmail && (
                <Alert className="mb-4 border-primary/30">
                  <AlertDescription>
                    Almost there. Confirm the address we just emailed you, then sign in below.
                  </AlertDescription>
                </Alert>
              )}

              <Tabs value={mode} onValueChange={(value) => setMode(value as "signin" | "signup")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form action={signInAction} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input id="signin-email" name="email" type="email" required autoComplete="email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                      />
                    </div>
                    {signInState.error && (
                      <Alert variant="destructive">
                        <AlertDescription>{signInState.error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={signInPending}>
                      {signInPending ? "Signing in…" : "Back to the bench"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form
                    action={signUpAction}
                    className="space-y-4 pt-4"
                    onSubmit={(event) => {
                      const form = event.currentTarget;
                      const timezoneField = form.elements.namedItem("timezone") as HTMLInputElement | null;
                      if (timezoneField) {
                        timezoneField.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
                      }
                    }}
                  >
                    <input type="hidden" name="timezone" />
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" name="email" type="email" required autoComplete="email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <p className="text-xs text-muted-foreground">8 characters at minimum.</p>
                    </div>
                    {signUpState.error && (
                      <Alert variant="destructive">
                        <AlertDescription>{signUpState.error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={signUpPending}>
                      {signUpPending ? "Setting things up…" : "Create account"}
                    </Button>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      We read your timezone from the browser, so &ldquo;today&rdquo; means your today, and
                      day boundaries land at your midnight, not ours.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Wondering what we store?{" "}
            <Link
              href="/privacy"
              className="underline decoration-border underline-offset-4 transition-colors hover:text-primary"
            >
              The privacy page is short.
            </Link>
          </p>
        </Reveal>
      </div>
    </div>
  );
}
