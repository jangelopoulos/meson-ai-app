import { requireAppSession } from "@/lib/auth/get-session";
import { getServerSupabase } from "@/lib/supabase/server";
import ContactsClient, { type Contact, type Project } from "./ContactsClient";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const session = await requireAppSession();
  const clientId = session.client?.id;

  if (!clientId) {
    return (
      <div className="text-sm" style={{ color: "var(--text-dim)" }}>
        No client linked to this account.
      </div>
    );
  }

  const supabase = await getServerSupabase();

  const [{ data: contactsData }, { data: projectsData }] = await Promise.all([
    supabase
      .from("client_contact")
      .select(
        "id, created_at, first_name, last_name, email, phone, address, project_id, last_contact_at, lead_reference"
      )
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("projects")
      .select("id, name")
      .eq("client_id", clientId),
  ]);

  const contacts: Contact[] = (contactsData ?? []) as Contact[];
  const projects: Project[] = (projectsData ?? []) as Project[];

  return <ContactsClient contacts={contacts} projects={projects} />;
}
