import { ConsultationForm } from "@/components/care/consultation-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "New consultation" };

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
    <div>
      <section className="patient-page-heading">
        <div>
          <h1>New Consultation</h1>
          <p>Five short steps. Saved profile details are reused when available, and only the questions needed for this consultation are shown.</p>
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
    </div>
  );
}
