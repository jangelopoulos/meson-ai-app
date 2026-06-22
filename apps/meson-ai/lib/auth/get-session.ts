import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import type { AppSession, PortalClient, PortalUser } from "./types";

export const getAppSession = cache(async (): Promise<AppSession | null> => {
  const supabase = await getServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const authUser = authData.user;
  if (!authUser) return null;

  const { data: userRow } = await supabase
    .from("users")
    .select(
      "id, supabase_uid, first_name, last_name, email, phone, role, active, client_id, project_id"
    )
    .eq("supabase_uid", authUser.id)
    .maybeSingle<PortalUser>();

  if (!userRow) return null;

  let client: PortalClient | null = null;
  if (userRow.client_id) {
    const { data: clientRow } = await supabase
      .from("clients")
      .select(
        "id, company_name, email, status, onboarding_stage, first_name, last_name, image"
      )
      .eq("id", userRow.client_id)
      .maybeSingle<PortalClient>();
    client = clientRow ?? null;
  }

  return { authUserId: authUser.id, user: userRow, client };
});

export async function requireAppSession(): Promise<AppSession> {
  const session = await getAppSession();
  if (!session) redirect("/");
  return session;
}
