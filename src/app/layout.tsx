import type { Metadata } from "next";
import { Cormorant_Garamond, Open_Sans, Source_Sans_3 } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import "./refinement.css";

const brand = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-brand",
  weight: ["500", "600"],
  display: "swap",
});

const sans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const headline = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://suga.health"),
  title: { default: "Suga.Health — Care that begins with listening", template: "%s | Suga.Health" },
  description: "Connect with a real doctor through a private, structured online consultation.",
  openGraph: { title: "Suga.Health", description: "Real doctors. Private consultations. Clear treatment guidance.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${brand.variable} ${sans.variable} ${headline.variable}`}>{children}<SpeedInsights /></body></html>;
}
