import { Suspense } from "react";
import ConversationsClient from "./ConversationsClient";

export default function ConversationsPage() {
  return (
    <Suspense fallback={<div className="text-sm">Loading…</div>}>
      <ConversationsClient />
    </Suspense>
  );
}
