import { TestAccountAccess } from "@/components/patient-flow-test/test-account-access";

export default async function PatientFlowTestAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const query = await searchParams;
  return <TestAccountAccess initialMode={query.mode === "login" ? "login" : "signup"} />;
}
