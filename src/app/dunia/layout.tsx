import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";

export const instant = false;

export default async function DuniaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/masuk");
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-canvas text-text select-none relative">
      {children}
    </div>
  );
}

