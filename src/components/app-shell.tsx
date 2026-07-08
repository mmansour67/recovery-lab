import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { BrandWordmark } from "@/components/brand";

export function AppShell({ email, children }: { email: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <BrandWordmark href="/dashboard" />
          <nav className="flex items-center gap-0.5 text-sm">
            <Button variant="ghost" size="sm" render={<Link href="/dashboard">Today</Link>} />
            <Button variant="ghost" size="sm" render={<Link href="/dashboard/settings">Settings</Link>} />
            <span className="mx-3 hidden max-w-44 truncate font-mono text-xs text-muted-foreground sm:inline">
              {email}
            </span>
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
