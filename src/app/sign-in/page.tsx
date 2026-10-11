import { EmptyAuthCard } from "@/components/auth/empty-auth-card";
import { PatientLoginForm } from "@/components/auth/patient-login-form";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return <EmptyAuthCard heading="Welcome back"><PatientLoginForm /></EmptyAuthCard>;
}
