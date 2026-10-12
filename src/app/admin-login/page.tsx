import { EmptyAuthCard } from "@/components/auth/empty-auth-card";
import { StaffLoginForm } from "@/components/auth/staff-login-form";

export const metadata = { title: "Admin & test login" };

export default function AdminLoginPage() {
  return (
    <EmptyAuthCard heading="Admin & test login">
      <StaffLoginForm />
    </EmptyAuthCard>
  );
}
