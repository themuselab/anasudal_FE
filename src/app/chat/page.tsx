import { Suspense } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { ChatView } from "@/components/chat/ChatView";

export const metadata = { title: "수달AI" };

export default function ChatPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <Suspense>
        <ChatView />
      </Suspense>
    </div>
  );
}
