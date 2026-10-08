/**
 * Stable, isolated QA identity for repeatedly rehearsing patient sign-up.
 * Never grants authentication or changes clinical records.
 */
export const QA_PATIENT_EMAIL = "patient123@gmail.com";
export const QA_PATIENT_ID = "77b1377f-1db8-4d5d-aa1c-0d64c7be9d4e";

export function isQaPatient(userId: string | null | undefined): boolean {
  return userId === QA_PATIENT_ID;
}

export const QA_FRESH_INTAKE_PATH = "/consultation/start?fresh=1";
