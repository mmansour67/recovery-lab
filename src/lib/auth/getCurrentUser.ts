import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import type { User } from "@/generated/prisma/client";

/**
 * Resolves the signed-in Supabase user into our own `users` row, creating
 * the profile on first sight. The Prisma User.id is kept equal to the
 * Supabase auth user id so the two systems never need a separate mapping
 * table.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) return null;

  const existing = await db.user.findUnique({ where: { id: authUser.id } });
  if (existing) return existing;

  return db.user.create({
    data: {
      id: authUser.id,
      email: authUser.email,
      timezone: (authUser.user_metadata?.timezone as string | undefined) ?? "UTC",
    },
  });
}

/** Same as getCurrentUser, but redirects to /login instead of returning null. */
export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
