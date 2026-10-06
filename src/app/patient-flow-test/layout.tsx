import type { ReactNode } from "react";
import { Open_Sans } from "next/font/google";
import "./patient-flow-test.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Patient flow test | Suga.Health",
  description: "Experimental Suga.Health patient onboarding and consultation flow.",
};

export default function PatientFlowTestLayout({ children }: { children: ReactNode }) {
  return <div className={openSans.className}>{children}</div>;
}
