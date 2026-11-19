import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { HudHeader } from "@/components/layout/hud-header";
import { HudFooter } from "@/components/layout/hud-footer";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export const instant = false;

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  if (!session) {
    redirect("/masuk");
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <HudHeader />
      <Suspense
        fallback={
          <div className="border-b border-border/50 bg-surface h-12 flex items-center px-4 font-body text-xs text-text-muted">
            Memuat navigasi...
          </div>
        }
      >
        <DashboardNav />
      </Suspense>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Suspense
          fallback={
            <div className="font-body text-xs text-text-muted p-8 rounded-3xl border-2 border-border bg-surface text-center">
              Memuat halaman...
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
