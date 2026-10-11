import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = { title: "Create account" };
export default function SignUpPage() { return <AuthShell title="Your care starts here." description="Create an account to begin your private consultation."><AuthForm mode="sign-up" /></AuthShell>; }
