import type { Metadata } from "next";
import { AppFooter, AppHeader } from "@/components/layout/AppHeader";
import { SharedResult } from "@/components/chat/SharedResult";

// 링크를 아는 사람만 보는 기록이다. 검색엔진에 올라가면 안 된다.
export const metadata: Metadata = {
  title: "살펴본 기록",
  robots: { index: false, follow: false },
};

export default async function SharedResultPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-10 pt-4 md:px-0 md:pt-6">
        <SharedResult token={token} />
      </main>
      <AppFooter />
    </div>
  );
}
