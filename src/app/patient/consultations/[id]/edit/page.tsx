import { notFound, redirect } from "next/navigation";
import { ConsultationForm } from "@/components/care/consultation-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditConsultationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("consultations")
    .select("id, primary_concern, responses, status")
    .eq("id", id)
    .single();

  if (!data) notFound();
  if (data.status !== "draft") redirect(`/patient/consultations/${id}`);

  return (
    <div>
      <section className="patient-page-heading">
        <div>
          <h1>Continue Consultation</h1>
          <p>Your saved draft remains private until you review and submit it.</p>
        </div>
      </section>
      {query.error && <p className="page-error" role="alert">We couldn’t save or submit this consultation. Review the details and try again.</p>}
      <ConsultationForm
        draft={{
          id: data.id,
          primary_concern: data.primary_concern,
          responses: (data.responses ?? {}) as Record<string, unknown>,
        }}
      />
    </div>
  );
}
