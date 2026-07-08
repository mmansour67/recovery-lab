import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCurrentUser();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="font-semibold">
            Recovery Lab
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/dashboard/settings">Settings</Link>
            <span>{user.email}</span>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
