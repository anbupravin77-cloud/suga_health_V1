import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-consultation",
  display: "swap",
});

export default function ConsultationLayout({ children }: { children: ReactNode }) {
  return <div className={inter.variable}>{children}</div>;
}
