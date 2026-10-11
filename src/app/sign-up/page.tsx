import { EmptyAuthCard } from "@/components/auth/empty-auth-card";
import { PhoneSignupForm } from "@/components/auth/phone-signup-form";

export const metadata = { title: "Create account" };

export default function SignUpPage() {
  return <EmptyAuthCard heading="Create your account"><PhoneSignupForm /></EmptyAuthCard>;
}
