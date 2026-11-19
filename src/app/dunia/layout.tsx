import * as React from "react";

export default function DuniaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen h-screen overflow-hidden bg-canvas text-text select-none relative">
      {children}
    </div>
  );
}
