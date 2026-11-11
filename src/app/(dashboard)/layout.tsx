import { Suspense } from "react";
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
      <Suspense
        fallback={
          <div className="border-b border-fluor/20 bg-night/90 h-12 flex items-center px-4 font-mono text-xs text-fluor/50">
            MEMUAT NAVIGASI SISTEM...
          </div>
        }
      >
        <DashboardNav />
      </Suspense>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Suspense
          fallback={
            <div className="font-mono text-xs text-caution p-8 border border-fluor/20 bg-night text-center">
              MEMUAT DATA PANEL 2D...
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
      <HudFooter />
    </div>
  );
}
