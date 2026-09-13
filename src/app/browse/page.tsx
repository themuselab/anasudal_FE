import { AppFooter, AppHeader } from "@/components/layout/AppHeader";
import { BrowseView } from "@/components/browse/BrowseView";

export const metadata = { title: "둘러보기" };

export default function BrowsePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <BrowseView />
      <AppFooter />
    </div>
  );
}
