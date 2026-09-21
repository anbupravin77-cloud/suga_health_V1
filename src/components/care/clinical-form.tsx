"use client";

import { useRef, useState } from "react";
import { saveClinicalWork } from "@/app/actions";

type Item = { medication_name: string; dosage: string; frequency: string; duration: string; instructions: string | null };
type Row = Item & { key: string };

const emptyItem: Item = { medication_name: "", dosage: "", frequency: "", duration: "", instructions: "" };

export function ClinicalForm({ consultationId, note, clinicianMessage, items }: {
  consultationId: string;
  note: string;
  clinicianMessage: string;
  items: Item[];
}) {
  const nextKey = useRef(items.length + 1);
  const [rows, setRows] = useState<Row[]>(() => (items.length ? items : [emptyItem]).map((item, index) => ({ ...item, key: `medication-${index}` })));

  return <form className="clinical-form" action={saveClinicalWork}>
    <input type="hidden" name="id" value={consultationId} />
    <section className="workspace-block">
      <div className="eyebrow">Private clinician workspace</div>
      <h2>Clinical note</h2>
      <p className="form-note">Visible only to the treating doctor. Patients never see this note.</p>
      <textarea name="clinical_note" defaultValue={note} required minLength={3} rows={7} placeholder="Clinical assessment and reasoning…" />
    </section>
    <section className="workspace-block">
      <div className="section-row"><div><div className="eyebrow">Treatment</div><h2>Prescription</h2></div><button className="text-button" type="button" onClick={() => { const key = `medication-${nextKey.current}`; nextKey.current += 1; setRows((current) => [...current, { ...emptyItem, key }]); }}>+ Add medication</button></div>
      <div className="prescription-builder">
        {rows.map((item, index) => <fieldset className="medication-row" key={item.key}>
          <legend>Medication {index + 1}</legend>
          <label>Medication name<input name="medication_name" defaultValue={item.medication_name} required /></label>
          <label>Dosage<input name="dosage" defaultValue={item.dosage} required placeholder="e.g. 500 mg" /></label>
          <label>Frequency<input name="frequency" defaultValue={item.frequency} required placeholder="e.g. Twice daily" /></label>
          <label>Duration<input name="duration" defaultValue={item.duration} required placeholder="e.g. 7 days" /></label>
          <label className="wide">Instructions<input name="instructions" defaultValue={item.instructions ?? ""} placeholder="Take after food" /></label>
          {rows.length > 1 && <button className="text-button remove" type="button" onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}>Remove</button>}
        </fieldset>)}
      </div>
    </section>
    <section className="workspace-block patient-facing">
      <div className="eyebrow">Patient-facing</div>
      <h2>Message from the clinician</h2>
      <p className="form-note">Use plain language for treatment guidance and follow-up instructions.</p>
      <textarea name="clinician_message" defaultValue={clinicianMessage} required minLength={3} rows={5} placeholder="Explain the treatment and what the patient should do next…" />
    </section>
    <div className="form-actions"><button className="button button-primary" type="submit">Save clinical work</button></div>
  </form>;
}
