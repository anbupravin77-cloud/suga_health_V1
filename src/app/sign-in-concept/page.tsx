import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthConceptShell } from "@/components/auth/auth-concept-shell";

export const metadata = { title: "Sign in concept | Suga.Health" };

export default function SignInConceptPage() {
  return (
    <AuthConceptShell>
      <Suspense fallback={<p>Loading secure sign in…</p>}>
        <AuthForm mode="sign-in" />
      </Suspense>
    </AuthConceptShell>
  );
}
