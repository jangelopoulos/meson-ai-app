import { BgBlobs } from "@/components/BgBlobs";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { CreateModalProvider } from "@/components/CreateModalContext";
import { CreateCampaignModal } from "@/components/CreateCampaignModal";
import { UserProvider } from "@/components/UserContext";
import { requireAppSession } from "@/lib/auth/get-session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAppSession();

  return (
    <UserProvider value={session}>
      <CreateModalProvider>
        <div className="relative min-h-screen">
          <BgBlobs />
          <div className="relative z-10 flex min-h-screen gap-5 p-5">
            <Sidebar />
            <main
              className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[22px]"
              style={{
                background: "var(--surface)",
                backdropFilter: "var(--glass-blur)",
                WebkitBackdropFilter: "var(--glass-blur)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow), inset 0 1px 0 var(--sheen)",
              }}
            >
              <Topbar />
              <div className="flex-1 overflow-auto p-6 md:p-7">{children}</div>
            </main>
          </div>
          <CreateCampaignModal />
        </div>
      </CreateModalProvider>
    </UserProvider>
  );
}
