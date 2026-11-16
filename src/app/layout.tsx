import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chama's Academy | Where Champions Train & Play",
  description:
    "Experience premium indoor cricket and football facilities at Chama's Academy. Book your game, compete with friends, and follow live match scores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#0B1426] text-white antialiased font-sans selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
        {children}
      </body>
    </html>
  );
}
