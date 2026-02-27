import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sanctuary - AI-Native Startup Accelerator",
    template: "%s | Sanctuary",
  },
  description:
    "The AI-native startup accelerator. 18 AI agents, $100K in funding, and 12 weeks to build the future. Apply now.",
  keywords: [
    "startup accelerator",
    "AI accelerator",
    "venture capital",
    "startup funding",
    "founder programme",
    "AI-native",
    "startup mentor",
  ],
  openGraph: {
    title: "Sanctuary - AI-Native Startup Accelerator",
    description:
      "18 AI agents. $100K in funding. 12 weeks to build the future.",
    siteName: "Sanctuary",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanctuary - AI-Native Startup Accelerator",
    description:
      "18 AI agents. $100K in funding. 12 weeks to build the future.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
