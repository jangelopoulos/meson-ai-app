"use server";

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { getAppSession } from "./get-session";

export type SignupActionResult = { ok: true } | { error: string };

const nowMs = () => Date.now();

async function sendSignupNotification(payload: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return;
  try {
    const res = await fetch(`${url}/functions/v1/send_signup_notification`, {
      method: "POST",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...payload, signup_at: new Date().toISOString() }),
    });
    if (!res.ok) {
      console.warn(`signup notification: ${res.status}`);
    }
  } catch (e) {
    console.warn("signup notification:", e instanceof Error ? e.message : e);
  }
}

export async function createAccount(input: {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
}): Promise<SignupActionResult> {
  const first_name = input.first_name.trim();
  const last_name = input.last_name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const password = input.password;

  if (!first_name || !last_name) return { error: "Name is required." };
  if (!email) return { error: "Email is required." };
  if (!password || password.length < 8)
    return { error: "Password must be at least 8 characters." };
  if (!phone || !phone.startsWith("+"))
    return { error: "Valid phone number is required." };

  const admin = getServiceSupabase();

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name, last_name, phone },
  });
  if (created.error || !created.data.user) {
    return { error: created.error?.message ?? "Could not create account." };
  }
  const authUserId = created.data.user.id;

  const insertRes = await admin
    .from("users")
    .insert({
      supabase_uid: authUserId,
      first_name,
      last_name,
      email,
      phone,
      role: "Admin",
      active: true,
      created_at: nowMs(),
    });
  if (insertRes.error) {
    await admin.auth.admin.deleteUser(authUserId).catch(() => {});
    return { error: insertRes.error.message };
  }

  void sendSignupNotification({ first_name, last_name, email, phone });

  const supabase = await getServerSupabase();
  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.error) return { error: signIn.error.message };

  return { ok: true };
}

export async function createCompany(input: {
  company_name: string;
  industry: string;
  address: string;
  suburb: string;
  state: string;
  country: string;
  postcode: string;
  website: string;
}): Promise<SignupActionResult> {
  const company_name = input.company_name.trim();
  if (!company_name) return { error: "Company name is required." };

  const session = await getAppSession();
  if (!session) return { error: "You must be signed in." };

  const admin = getServiceSupabase();
  const postcode = input.postcode.trim() ? Number(input.postcode) : null;

  const row = {
    company_name,
    email: session.user.email,
    billing_email: session.user.email,
    phone: session.user.phone || "",
    address: input.address.trim(),
    suburb: input.suburb.trim(),
    state: input.state.trim(),
    country: input.country.trim() || "Australia",
    postcode,
    website: input.website.trim(),
    industry: input.industry.trim(),
    first_name: session.user.first_name,
    last_name: session.user.last_name,
    status: "AI Onboarding",
    account_type: "Sign Up",
    onboarding_stage: "Account created",
    charge_type: "",
    area_type: "",
    rea_link: "",
    connex_id: "",
    xero_account_number: "",
    airtable_record_id: "",
    gocardless_id: "",
    pinpayment_id: "",
    addon_requested: "",
    communication_preference: "",
    services_requested: [] as string[],
    auto_renew: true,
    not_launched: true,
    onboarding_email_sent: false,
    booked_first_week_review: false,
    turn_off_inbound: false,
    outbound_credit_amount: 0,
    inbound_credit_amount: 0,
    nea_credit_amount: 0,
    created_at: nowMs(),
  };

  const insertRes = await admin
    .from("clients")
    .insert(row)
    .select("id")
    .single();
  if (insertRes.error || !insertRes.data) {
    return { error: insertRes.error?.message ?? "Could not create company." };
  }
  const clientId = insertRes.data.id as string;

  const updRes = await admin
    .from("users")
    .update({ client_id: clientId })
    .eq("id", session.user.id);
  if (updRes.error) return { error: updRes.error.message };

  return { ok: true };
}

export async function selectPlan(input: {
  plan: string;
  billing_period: "monthly" | "yearly";
}): Promise<SignupActionResult> {
  const session = await getAppSession();
  if (!session || !session.client) return { error: "No client to update." };

  const admin = getServiceSupabase();
  const updRes = await admin
    .from("clients")
    .update({
      selected_plan: input.plan,
      selected_billing_period: input.billing_period,
    })
    .eq("id", session.client.id);
  if (updRes.error) return { error: updRes.error.message };
  return { ok: true };
}

export async function completeSignup(): Promise<void> {
  const session = await getAppSession();
  if (session?.client) {
    const admin = getServiceSupabase();
    await admin
      .from("clients")
      .update({ status: "Active" })
      .eq("id", session.client.id);
  }
  redirect("/app/dashboard");
}

export type SignupStepState = {
  hasUserRow: boolean;
  hasClientId: boolean;
  hasPlanSelected: boolean;
  clientStatus: string | null;
};

export async function getSignupState(): Promise<SignupStepState> {
  const session = await getAppSession();
  if (!session) {
    return {
      hasUserRow: false,
      hasClientId: false,
      hasPlanSelected: false,
      clientStatus: null,
    };
  }
  let hasPlanSelected = false;
  let clientStatus: string | null = null;
  if (session.client) {
    clientStatus = session.client.status ?? null;
    const admin = getServiceSupabase();
    const planRes = await admin
      .from("clients")
      .select("selected_plan")
      .eq("id", session.client.id)
      .maybeSingle();
    hasPlanSelected = !!planRes.data?.selected_plan;
  }
  return {
    hasUserRow: true,
    hasClientId: !!session.user.client_id,
    hasPlanSelected,
    clientStatus,
  };
}
