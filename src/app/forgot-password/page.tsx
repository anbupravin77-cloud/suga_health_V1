import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = { title: "Reset password" };
export default function ForgotPasswordPage() { return <AuthShell title="Reset your password" description="We'll send a secure reset link to your email."><AuthForm mode="forgot-password" /></AuthShell>; }
