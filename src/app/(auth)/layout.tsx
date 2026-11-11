import { HudHeader } from "@/components/layout/hud-header";
import { HudFooter } from "@/components/layout/hud-footer";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-night text-fluor">
      <HudHeader />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <HudFooter />
    </div>
  );
}

