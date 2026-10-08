import { redirect } from "next/navigation";

export default async function EditConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/consultation/${encodeURIComponent(id)}/edit`);
}
