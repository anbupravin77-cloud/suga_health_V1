import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = { title: "Create account" };
export default function SignUpPage() { return <AuthShell title="Begin your care" description="Create a patient account to start a private consultation."><AuthForm mode="sign-up" /></AuthShell>; }
