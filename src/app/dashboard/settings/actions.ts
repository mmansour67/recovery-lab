"use server";

import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/getCurrentUser";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db";

/**
 * Deletes the user's Recovery Lab account entirely: the Prisma User row
 * cascades to every experiment, check-in, and synced WHOOP record, and the
 * Supabase auth user is removed so they can't log back in to an empty
 * account. This is separate from disconnecting WHOOP, which only revokes
 * API access and keeps past results intact.
 */
export async function deleteAccountAction() {
  const user = await requireCurrentUser();

  await db.user.delete({ where: { id: user.id } });

  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(user.id);

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}
