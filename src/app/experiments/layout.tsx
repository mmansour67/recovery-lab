import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { AppShell } from "@/components/app-shell";

export default async function ExperimentsLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCurrentUser();
  return <AppShell email={user.email}>{children}</AppShell>;
}
