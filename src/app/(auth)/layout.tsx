import { HudHeader } from "@/components/layout/hud-header";
import { HudFooter } from "@/components/layout/hud-footer";
import { GsapFadeUp } from "@/components/animations/gsap-animate";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <HudHeader />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <GsapFadeUp className="w-full max-w-md">
          {children}
        </GsapFadeUp>
      </main>
      <HudFooter />
    </div>
  );
}

