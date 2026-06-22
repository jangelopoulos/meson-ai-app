"use server";

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import type { LoginEdgeResponse } from "./types";

export type SignInState = { error?: string } | null;

export async function signIn(
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let res: Response;
  try {
    res = await fetch(`${url}/functions/v1/client_portal_login`, {
      method: "POST",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { error: "Network error. Try again." };
  }

  if (!res.ok) {
    let msg = "Invalid email or password.";
    try {
      const body = (await res.json()) as { error?: string; message?: string };
      msg = body.error ?? body.message ?? msg;
    } catch {}
    return { error: msg };
  }

  let payload: LoginEdgeResponse;
  try {
    payload = (await res.json()) as LoginEdgeResponse;
  } catch {
    return { error: "Unexpected response from sign-in." };
  }

  if (!payload.authToken || !payload.refreshToken) {
    return { error: "Sign-in did not return a session." };
  }

  const supabase = await getServerSupabase();
  const { error: setErr } = await supabase.auth.setSession({
    access_token: payload.authToken,
    refresh_token: payload.refreshToken,
  });
  if (setErr) return { error: setErr.message };

  redirect("/app/dashboard");
}

export async function signOut() {
  const supabase = await getServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}
