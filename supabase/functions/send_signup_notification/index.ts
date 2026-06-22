// Sends a "New AI Sign Up" email to the Meson team via Resend.
//
// Required secrets on the deployed function:
//   RESEND_API_KEY   - API key from https://resend.com
//   FROM_ADDRESS     - verified sender, e.g. "signups@mesonagency.com"
//
// Deploy with:
//   supabase functions deploy send_signup_notification --no-verify-jwt
//
// (no-verify-jwt because the Next.js server calls this with the anon key only.)

type Payload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  signup_at?: string;
};

const TO = ["nick@mesonai.com", "john@mesonai.com"];
const SUBJECT = "New AI Sign Up";

function htmlBody(p: Payload): string {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 10px;color:#666;">${k}</td><td style="padding:6px 10px;font-weight:600;">${v}</td></tr>`;
  return `
    <div style="font-family:Helvetica,Arial,sans-serif;color:#111;">
      <h2 style="margin:0 0 14px 0;">New AI sign up</h2>
      <table style="border-collapse:collapse;font-size:14px;">
        ${row("Name", `${p.first_name} ${p.last_name}`)}
        ${row("Email", p.email)}
        ${row("Phone", p.phone)}
        ${row("Signed up", p.signup_at ?? new Date().toISOString())}
      </table>
    </div>
  `;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("FROM_ADDRESS") ?? "signups@mesonagency.com";
  if (!apiKey) {
    return new Response("RESEND_API_KEY missing", { status: 500 });
  }

  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: TO,
      subject: SUBJECT,
      html: htmlBody(payload),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(`Resend error: ${text}`, { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
