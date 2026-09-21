"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, type AppRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function saveConsultation(formData: FormData) {
  const { user } = await requireRole("patient");
  const supabase = await createClient();
  const id = value(formData, "id");
  const shouldSubmit = value(formData, "intent") === "submit";
  const record = {
    patient_id: user.id,
    primary_concern: value(formData, "primary_concern"),
    symptoms: value(formData, "symptoms"),
    symptom_duration: value(formData, "symptom_duration") || null,
    relevant_context: value(formData, "relevant_context") || null,
  };

  const result = id
    ? await supabase.from("consultations").update(record).eq("id", id).eq("status", "draft").select("id").single()
    : await supabase.from("consultations").insert(record).select("id").single();

  if (result.error || !result.data) {
    redirect(`/patient/consultations/${id ? `${id}/edit` : "new"}?error=save`);
  }

  if (shouldSubmit) {
    const { error } = await supabase.rpc("submit_consultation", { p_consultation_id: result.data.id });
    if (error) redirect(`/patient/consultations/${result.data.id}/edit?error=submit`);
  }

  revalidatePath("/patient");
  revalidatePath("/patient/consultations");
  redirect(`/patient/consultations/${result.data.id}?notice=${shouldSubmit ? "submitted" : "saved"}`);
}

export async function deleteDraft(formData: FormData) {
  await requireRole("patient");
  const supabase = await createClient();
  await supabase.from("consultations").delete().eq("id", value(formData, "id")).eq("status", "draft");
  revalidatePath("/patient/consultations");
  redirect("/patient/consultations?notice=deleted");
}

export async function claimConsultation(formData: FormData) {
  await requireRole("doctor");
  const supabase = await createClient();
  const id = value(formData, "id");
  const { error } = await supabase.rpc("claim_consultation", { p_consultation_id: id });
  if (error) redirect("/doctor?error=claim");
  revalidatePath("/doctor");
  redirect(`/doctor/consultations/${id}?notice=claimed`);
}

export async function saveClinicalWork(formData: FormData) {
  await requireRole("doctor");
  const supabase = await createClient();
  const id = value(formData, "id");
  const medications = formData.getAll("medication_name").map(String);
  const dosages = formData.getAll("dosage").map(String);
  const frequencies = formData.getAll("frequency").map(String);
  const durations = formData.getAll("duration").map(String);
  const instructions = formData.getAll("instructions").map(String);
  const items = medications.map((medication_name, index) => ({
    medication_name,
    dosage: dosages[index] ?? "",
    frequency: frequencies[index] ?? "",
    duration: durations[index] ?? "",
    instructions: instructions[index] ?? "",
  }));
  const { error } = await supabase.rpc("save_clinical_work", {
    p_consultation_id: id,
    p_note: value(formData, "clinical_note"),
    p_clinician_message: value(formData, "clinician_message"),
    p_items: items,
  });
  if (error) redirect(`/doctor/consultations/${id}?error=save`);
  revalidatePath(`/doctor/consultations/${id}`);
  redirect(`/doctor/consultations/${id}?notice=saved`);
}

export async function completeConsultation(formData: FormData) {
  await requireRole("doctor");
  const supabase = await createClient();
  const id = value(formData, "id");
  const { error } = await supabase.rpc("complete_consultation", { p_consultation_id: id });
  if (error) redirect(`/doctor/consultations/${id}?error=complete`);
  revalidatePath("/doctor");
  revalidatePath("/doctor/active-reviews");
  redirect(`/doctor/consultations/${id}?notice=completed`);
}

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const threadId = value(formData, "thread_id");
  const returnTo = value(formData, "return_to");
  const { error } = await supabase.from("messages").insert({
    thread_id: threadId,
    sender_id: user.id,
    body: value(formData, "body"),
  });
  if (error) redirect(`${returnTo}?error=message`);
  revalidatePath(returnTo);
  redirect(`${returnTo}?notice=message-sent`);
}

export async function markNotificationsRead(formData: FormData) {
  const role: AppRole = value(formData, "role") === "doctor" ? "doctor" : "patient";
  const { user } = await requireRole(role);
  const supabase = await createClient();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("recipient_id", user.id).is("read_at", null);
  revalidatePath(`/${role}/notifications`);
}

export async function updateProfile(formData: FormData) {
  const role: AppRole = value(formData, "role") === "doctor" ? "doctor" : "patient";
  const { user } = await requireRole(role);
  const supabase = await createClient();

  if (role === "patient") {
    const firstName = value(formData, "first_name");
    const lastName = value(formData, "last_name");
    const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();

    const { error } = await supabase.from("profiles").update({
      first_name: firstName || null,
      last_name: lastName || null,
      display_name: displayName || null,
      phone_number: value(formData, "phone_number") || null,
      date_of_birth: value(formData, "date_of_birth") || null,
    }).eq("id", user.id);

    if (error) redirect("/patient/profile?error=save");
    revalidatePath("/patient/profile");
    redirect("/patient/profile?notice=saved");
  }

  const fullName = value(formData, "full_name");
  const { error } = await supabase.from("profiles").update({
    display_name: fullName || null,
    phone_number: value(formData, "phone") || null,
  }).eq("id", user.id);
  if (error) redirect("/doctor/profile?error=save");

  revalidatePath("/doctor/profile");
  redirect("/doctor/profile?notice=saved");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
