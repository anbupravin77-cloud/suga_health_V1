import { ConsultationForm } from "@/components/care/consultation-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Start consultation" };

function ageFromDate(dateOfBirth: string | null) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDelta = now.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

export default async function NewConsultationPage() {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("height_cm, weight_kg, date_of_birth, sex")
    .single();

  return (
    <>
      <section className="dashboard-heading compact-heading">
        <div>
          <span className="eyebrow">Private consultation</span>
          <h1>Start your clinical intake.</h1>
          <p>Six short steps. Your answers stay in the Patient Portal while the clinical data is routed securely to the assigned doctor.</p>
        </div>
      </section>
      <ConsultationForm
        defaults={{
          height_cm: profile?.height_cm == null ? null : Number(profile.height_cm),
          weight_kg: profile?.weight_kg == null ? null : Number(profile.weight_kg),
          age: ageFromDate(profile?.date_of_birth ?? null),
          sex: profile?.sex ?? null,
        }}
      />
    </>
  );
}
