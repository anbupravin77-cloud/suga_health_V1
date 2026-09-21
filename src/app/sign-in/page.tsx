import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = { title: "Sign in" };
export default function SignInPage() { return <AuthShell title="Welcome back" description="Sign in to continue your care."><Suspense fallback={<p>Loading secure sign in…</p>}><AuthForm mode="sign-in" /></Suspense></AuthShell>; }
