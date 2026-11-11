import { HudHeader } from "@/components/layout/hud-header";
import { HudFooter } from "@/components/layout/hud-footer";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-night text-fluor">
      <HudHeader />
      <DashboardNav />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <HudFooter />
    </div>
  );
}
