"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireActionRole, type AppRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string) {
  const parsed = Number(value(formData, key));
  return Number.isFinite(parsed) ? parsed : null;
}

function checked(formData: FormData, key: string) {
  const raw = value(formData, key);
  return raw === "true" || raw === "on" || raw === "1";
}

function buildConsultationRecord(formData: FormData, patientId: string) {
  const primaryConcern = value(formData, "primary_concern");
  if (!["weight", "hair", "sex"].includes(primaryConcern)) {
    throw new Error("Choose a valid care area.");
  }

  const heightUnit = value(formData, "height_unit") === "ftin" ? "ftin" : "cm";
  const weightUnit = value(formData, "weight_unit") === "lb" ? "lb" : "kg";
  const heightCmInput = numberValue(formData, "height_cm");
  const heightFeet = numberValue(formData, "height_feet");
  const heightInches = numberValue(formData, "height_inches");
  const weightInput = numberValue(formData, "weight_value");
  const age = numberValue(formData, "age");
  const sex = value(formData, "sex");

  const heightCm =
    heightUnit === "cm"
      ? heightCmInput
      : heightFeet !== null
        ? Math.round(((heightFeet * 12 + (heightInches ?? 0)) * 2.54) * 10) / 10
        : null;

  const weightKg =
    weightInput === null
      ? null
      : weightUnit === "kg"
        ? Math.round(weightInput * 10) / 10
        : Math.round(weightInput * 0.45359237 * 10) / 10;

  return {
    patient_id: patientId,
    primary_concern: primaryConcern,
    schema_version: 2,
    responses: {
      primary_concern: primaryConcern,
      height_unit: heightUnit,
      height_cm_input: heightCmInput,
      height_feet: heightFeet,
      height_inches: heightInches,
      height_cm: heightCm,
      weight_unit: weightUnit,
      weight_value: weightInput,
      weight_kg: weightKg,
      age,
      sex,
      conditions: formData.getAll("conditions").map(String).filter(Boolean),
      current_medications: value(formData, "current_medications"),
      allergies: value(formData, "allergies"),
      medical_history: value(formData, "medical_history"),
      care_goal: value(formData, "care_goal"),
      consent_truth: checked(formData, "consent_truth"),
      consent_telehealth: checked(formData, "consent_telehealth"),
      consent_privacy: checked(formData, "consent_privacy"),
    },
  };
}

async function persistConsultation(formData: FormData, patientId: string) {
  const supabase = await createClient();
  const id = value(formData, "id");
  const record = buildConsultationRecord(formData, patientId);

  const result = id
    ? await supabase
        .from("consultations")
        .update(record)
        .eq("id", id)
        .eq("patient_id", patientId)
        .eq("status", "draft")
        .select("id")
        .single()
    : await supabase.from("consultations").insert(record).select("id").single();

  if (result.error || !result.data) {
    return { ok: false as const, error: result.error?.message || "Unable to save the consultation." };
  }

  return { ok: true as const, id: result.data.id, record };
}

export async function saveConsultationDraft(formData: FormData) {
  const { user } = await requireActionRole("patient");

  try {
    const result = await persistConsultation(formData, user.id);
    if (!result.ok) return result;

    revalidatePath("/patient");
    revalidatePath("/patient/consultations");
    return { ok: true, id: result.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to save the consultation." };
  }
}

export async function submitConsultation(formData: FormData) {
  const { user } = await requireActionRole("patient");

  try {
    const consentOk =
      checked(formData, "consent_truth") &&
      checked(formData, "consent_telehealth") &&
      checked(formData, "consent_privacy");

    if (!consentOk) return { ok: false, error: "All three consent statements are required." };

    const record = buildConsultationRecord(formData, user.id);
    const responses = record.responses as Record<string, unknown>;

    if (!responses.height_cm || !responses.weight_kg || !responses.age || !responses.sex) {
      return { ok: false, error: "Height, weight, age, and sex are required before submission." };
    }
    if (!Array.isArray(responses.conditions) || responses.conditions.length === 0) {
      return { ok: false, error: "Select the applicable medical conditions or choose None of the above." };
    }

    const saved = await persistConsultation(formData, user.id);
    if (!saved.ok) return saved;

    const supabase = await createClient();
    const { error } = await supabase.rpc("v1_submit_consultation", {
      p_consultation_id: saved.id,
    });

    if (error) return { ok: false, error: error.message || "Unable to submit the consultation." };

    if (typeof responses.height_cm === "number" && typeof responses.weight_kg === "number") {
      await supabase
        .from("profiles")
        .update({
          height_cm: responses.height_cm,
          weight_kg: responses.weight_kg,
          sex: typeof responses.sex === "string" ? responses.sex : null,
        })
        .eq("id", user.id);
    }

    revalidatePath("/patient");
    revalidatePath("/patient/consultations");
    revalidatePath("/patient/notifications");
    revalidatePath("/doctor");
    revalidatePath("/doctor/notifications");

    return { ok: true, id: saved.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to submit the consultation." };
  }
}

export async function deleteDraft(formData: FormData) {
  await requireActionRole("patient");
  const supabase = await createClient();
  const id = value(formData, "id");

  const { error } = await supabase.rpc("v1_delete_draft", {
    p_consultation_id: id,
  });

  if (error) redirect("/patient/consultations?error=delete");

  revalidatePath("/patient");
  revalidatePath("/patient/consultations");
  redirect("/patient/consultations?notice=deleted");
}

export async function claimConsultation(formData: FormData) {
  await requireActionRole("doctor");
  const supabase = await createClient();
  const id = value(formData, "id");

  const { error } = await supabase.rpc("v1_claim_consultation", {
    p_consultation_id: id,
  });

  if (error) redirect("/doctor?error=claim");

  revalidatePath("/doctor");
  revalidatePath("/doctor/active-reviews");
  revalidatePath("/patient/notifications");
  redirect(`/doctor/consultations/${id}?notice=claimed`);
}

export async function saveTreatmentOptions(formData: FormData) {
  await requireActionRole("doctor");
  const supabase = await createClient();
  const id = value(formData, "id");

  let options: unknown;
  try {
    options = JSON.parse(value(formData, "options_json"));
  } catch {
    return { ok: false, error: "The prescription options could not be read." };
  }

  const { error } = await supabase.rpc("v1_save_treatment_options", {
    p_consultation_id: id,
    p_clinical_note: value(formData, "clinical_note"),
    p_options: options,
  });

  if (error) return { ok: false, error: error.message || "Unable to save clinical work." };

  revalidatePath(`/doctor/consultations/${id}`);
  return { ok: true };
}

export async function completeConsultationNow(consultationId: string) {
  await requireActionRole("doctor");
  const supabase = await createClient();

  const { error } = await supabase.rpc("v1_complete_consultation_options", {
    p_consultation_id: consultationId,
  });

  if (error) return { ok: false, error: error.message || "Unable to complete the consultation." };

  revalidatePath("/doctor");
  revalidatePath("/doctor/active-reviews");
  revalidatePath(`/doctor/consultations/${consultationId}`);
  revalidatePath("/patient");
  revalidatePath("/patient/consultations");
  revalidatePath("/patient/notifications");
  return { ok: true };
}

export async function selectTreatmentOption(optionId: string) {
  await requireActionRole("patient");
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("v1_select_prescription_option", {
    p_option_id: optionId,
  });

  if (error) return { ok: false, error: error.message || "Unable to select this treatment option." };

  const consultationId =
    data && typeof data === "object" && "consultationId" in data
      ? String((data as { consultationId: unknown }).consultationId)
      : null;

  if (consultationId) revalidatePath(`/patient/consultations/${consultationId}`);
  revalidatePath("/patient");
  revalidatePath("/patient/notifications");
  return { ok: true, consultationId };
}

export async function sendMessageNow(threadId: string, body: string) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims as Record<string, unknown> | undefined;
  if (!claims?.sub) return { ok: false, error: "Your session expired. Sign in again." };

  const cleanBody = body.trim();
  if (!cleanBody) return { ok: false, error: "Write a message first." };
  if (cleanBody.length > 3000) return { ok: false, error: "Keep the message under 3000 characters." };

  const { error } = await supabase.rpc("v1_send_message", {
    p_thread_id: threadId,
    p_message_text: cleanBody,
  });

  if (error) return { ok: false, error: error.message || "Unable to send the message." };

  revalidatePath("/patient/messages");
  revalidatePath("/doctor/messages");
  revalidatePath("/patient/notifications");
  revalidatePath("/doctor/notifications");
  return { ok: true };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return { ok: false, error: "Your session expired." };

  const { error } = await supabase.rpc("v1_mark_all_notifications_read");
  if (error) return { ok: false, error: error.message || "Unable to mark notifications as read." };

  revalidatePath("/patient");
  revalidatePath("/patient/notifications");
  revalidatePath("/doctor/notifications");
  return { ok: true };
}

export async function markNotificationsRead(formData: FormData) {
  const role: AppRole = value(formData, "role") === "doctor" ? "doctor" : "patient";
  await requireActionRole(role);
  await markAllNotificationsRead();
  revalidatePath(`/${role}/notifications`);
}

export type OnboardingState = {
  error: string;
};

export async function completePatientOnboarding(
  _previousState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const { user } = await requireActionRole("patient");
  const supabase = await createClient();

  const firstName = value(formData, "first_name");
  const lastName = value(formData, "last_name");
  const email = value(formData, "email").toLowerCase();
  const password = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");
  const address = value(formData, "address");
  const dateOfBirth = value(formData, "date_of_birth");
  const weightValue = numberValue(formData, "weight_value");
  const heightValue = numberValue(formData, "height_value");
  const weightUnit = value(formData, "weight_unit") === "lb" ? "lb" : "kg";
  const heightUnit = value(formData, "height_unit") === "in" ? "in" : "cm";

  if (!firstName || !lastName) return { error: "Enter your name." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email." };
  if (password.length < 8) return { error: "Use at least 8 characters for your password." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };
  if (!address) return { error: "Enter your shipping address." };

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();
  if (
    !dateOfBirth ||
    Number.isNaN(birthDate.getTime()) ||
    birthDate.getFullYear() < 1900 ||
    birthDate > today
  ) {
    return { error: "Check your date of birth." };
  }

  if (weightValue === null || weightValue <= 0) return { error: "Enter your weight." };
  if (heightValue === null || heightValue <= 0) return { error: "Enter your height." };

  const weightKg =
    weightUnit === "kg"
      ? Math.round(weightValue * 10) / 10
      : Math.round(weightValue * 0.45359237 * 10) / 10;

  const heightCm =
    heightUnit === "cm"
      ? Math.round(heightValue * 10) / 10
      : Math.round(heightValue * 2.54 * 10) / 10;

  if (weightKg > 500 || heightCm > 300) return { error: "Check your measurements." };

  const displayName = `${firstName} ${lastName}`.trim();

  // Persist patient-entered details first. If an auth mutation fails afterward,
  // onboarding stays required and the patient's form data remains available.
  const { error: draftProfileError } = await supabase
    .from("profiles")
    .update({
      email,
      first_name: firstName,
      last_name: lastName,
      display_name: displayName,
      shipping_address: {
        recipientName: displayName,
        line1: address,
      },
      date_of_birth: dateOfBirth,
      weight_kg: weightKg,
      height_cm: heightCm,
    })
    .eq("id", user.id);

  if (draftProfileError) {
    console.error("Onboarding profile draft failed", draftProfileError);
    return { error: "We couldn't save your profile. Please try again." };
  }

  const { error: credentialsError } = await supabase.auth.updateUser({
    password,
    data: {
      full_name: displayName,
      first_name: firstName,
      last_name: lastName,
    },
  });

  if (credentialsError) {
    console.error("Onboarding credential update failed", credentialsError);
    return { error: "Your profile is safe, but the password couldn't be saved. Please try another password." };
  }

  // A phone-created account may be given an email that already belongs to a
  // different Supabase identity. Keep that email as the patient's contact
  // address and do not block onboarding when auth email linking is unavailable.
  if (email !== (user.email ?? "").toLowerCase()) {
    const { error: emailLinkError } = await supabase.auth.updateUser({ email });
    if (emailLinkError) {
      console.warn("Onboarding email auth link skipped", emailLinkError.message);
    }
  }

  const { error: completionError } = await supabase
    .from("profiles")
    .update({
      profile_completed_at: new Date().toISOString(),
      requires_onboarding: false,
    })
    .eq("id", user.id);

  if (completionError) {
    console.error("Onboarding completion flag failed", completionError);
    return { error: "Your details were saved, but setup couldn't finish. Please try again." };
  }

  revalidatePath("/patient");
  revalidatePath("/patient/profile");
  redirect("/patient");
}

export async function updateProfile(formData: FormData) {
  const role: AppRole = value(formData, "role") === "doctor" ? "doctor" : "patient";
  const { user } = await requireActionRole(role);
  const supabase = await createClient();

  if (role === "patient") {
    const firstName = value(formData, "first_name");
    const lastName = value(formData, "last_name");
    const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName || null,
        last_name: lastName || null,
        display_name: displayName || null,
        phone_number: value(formData, "phone_number") || null,
        date_of_birth: value(formData, "date_of_birth") || null,
      })
      .eq("id", user.id);

    if (error) redirect("/patient/profile?error=save");
    revalidatePath("/patient/profile");
    redirect("/patient/profile?notice=saved");
  }

  const displayName = value(formData, "display_name");
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      phone_number: value(formData, "phone_number") || null,
    })
    .eq("id", user.id);

  if (error) redirect("/doctor/profile?error=save");

  revalidatePath("/doctor/profile");
  redirect("/doctor/profile?notice=saved");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
