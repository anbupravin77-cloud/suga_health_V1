import Link from "next/link";
import { saveConsultation } from "@/app/actions";

type Draft = { id: string; primary_concern: string; symptoms: string; symptom_duration: string | null; relevant_context: string | null };

export function ConsultationForm({ draft }: { draft?: Draft }) {
  return <form className="intake-form" action={saveConsultation}>
    {draft && <input type="hidden" name="id" value={draft.id} />}
    <div className="form-section-heading"><span>01</span><div><h2>What brings you here?</h2><p>Give your doctor a clear starting point. You can save this privately and return later.</p></div></div>
    <label>Primary concern<input name="primary_concern" defaultValue={draft?.primary_concern} required minLength={3} maxLength={160} placeholder="e.g. Persistent headache" /></label>
    <label>Describe your symptoms<textarea name="symptoms" defaultValue={draft?.symptoms} required minLength={10} maxLength={5000} rows={7} placeholder="What are you experiencing? Include anything that feels important." /></label>
    <div className="form-section-heading"><span>02</span><div><h2>Add useful context</h2><p>These details help the doctor understand the situation. Avoid sharing anything unrelated.</p></div></div>
    <label>How long has this been happening?<input name="symptom_duration" defaultValue={draft?.symptom_duration ?? ""} placeholder="e.g. About three days" /></label>
    <label>Relevant context <em>Optional</em><textarea name="relevant_context" defaultValue={draft?.relevant_context ?? ""} rows={5} placeholder="Relevant medication, allergies, medical history, or changes you noticed." /></label>
    <p className="privacy-note">Your draft is visible only to you until you submit it. For emergencies, contact local emergency services.</p>
    <div className="form-actions"><Link className="button button-secondary" href="/patient/consultations">Cancel</Link><button className="button button-secondary" name="intent" value="draft" type="submit">Save draft</button><button className="button button-primary" name="intent" value="submit" type="submit">Submit to a doctor</button></div>
  </form>;
}
