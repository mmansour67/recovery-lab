"use client";

import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signUp, type AuthActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Recovery Lab</CardTitle>
          <CardDescription>Run honest, single-person experiments on your own habits.</CardDescription>
        </CardHeader>
        <CardContent>
          {checkEmail && (
            <Alert className="mb-4">
              <AlertDescription>Check your email to confirm your account, then sign in.</AlertDescription>
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
                  {signInPending ? "Signing in…" : "Sign in"}
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
                </div>
                {signUpState.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{signUpState.error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={signUpPending}>
                  {signUpPending ? "Creating account…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
