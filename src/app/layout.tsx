import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sekolah Tengah Malam",
  description: "Platform diskusi dan forum pembelajaran virtual",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
