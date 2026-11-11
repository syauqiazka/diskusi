import type { Metadata } from "next";
import { VT323, Anton, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

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
    <html
      lang="id"
      className={`${vt323.variable} ${anton.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-night text-fluor font-body min-h-screen antialiased selection:bg-caution selection:text-night">
        {children}
      </body>
    </html>
  );
}
