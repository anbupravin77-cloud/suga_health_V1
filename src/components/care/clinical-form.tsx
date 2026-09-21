"use client";

import { CheckCircle2, LoaderCircle, Plus, Search, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { completeConsultationNow, saveTreatmentOptions } from "@/app/actions";

export type MedicationCatalogItem = {
  id: string;
  treatment_area: string;
  display_name: string;
  generic_name: string;
  strength: string;
  dosage_form: string;
  description: string | null;
};

export type ExistingTreatmentOption = {
  id: string;
  position: number;
  title: string;
  cost_tier: string;
  description: string;
  estimated_price_inr: number | null;
  status: string;
  consultation_prescription_option_items: Array<{
    id: string;
    position: number;
    medication_catalog_id: string | null;
    medication_name: string;
    strength: string;
    dosage_form: string;
    frequency: string;
    duration: string;
    instructions: string | null;
  }>;
};

type DraftMedicine = {
  key: string;
  catalogId: string;
  medicationName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  frequency: string;
  duration: string;
  instructions: string;
};

type DraftOption = {
  key: string;
  title: string;
  costTier: "budget" | "balanced" | "premium" | "custom";
  description: string;
  estimatedPrice: string;
  search: string;
  medicines: DraftMedicine[];
};

function medicineKey(index: number) {
  return `medicine-${index}`;
}

function optionFromExisting(option: ExistingTreatmentOption, index: number): DraftOption {
  return {
    key: `option-${option.id || index}`,
    title: option.title || `Prescription ${index + 1}`,
    costTier: ["budget", "balanced", "premium", "custom"].includes(option.cost_tier)
      ? option.cost_tier as DraftOption["costTier"]
      : "custom",
    description: option.description || "",
    estimatedPrice: option.estimated_price_inr == null ? "" : String(option.estimated_price_inr),
    search: "",
    medicines: [...(option.consultation_prescription_option_items ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((item, itemIndex) => ({
        key: medicineKey(itemIndex),
        catalogId: item.medication_catalog_id || "",
        medicationName: item.medication_name,
        genericName: item.medication_name,
        strength: item.strength,
        dosageForm: item.dosage_form,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions || "",
      })),
  };
}

function blankOption(index: number): DraftOption {
  return {
    key: `option-new-${index}`,
    title: `Prescription ${index}`,
    costTier: index === 1 ? "balanced" : "custom",
    description: "",
    estimatedPrice: "",
    search: "",
    medicines: [],
  };
}

export function ClinicalForm({
  consultationId,
  treatmentArea,
  note,
  options: existingOptions,
  catalog,
}: {
  consultationId: string;
  treatmentArea: string;
  note: string;
  options: ExistingTreatmentOption[];
  catalog: MedicationCatalogItem[];
}) {
  const router = useRouter();
  const keyCounter = useRef(1000);
  const [clinicalNote, setClinicalNote] = useState(note);
  const [options, setOptions] = useState<DraftOption[]>(() =>
    existingOptions.length
      ? existingOptions.map(optionFromExisting)
      : [blankOption(1)],
  );
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  function updateOption(key: string, patch: Partial<DraftOption>) {
    setOptions((current) => current.map((option) => option.key === key ? { ...option, ...patch } : option));
    setError("");
  }

  function addPrescriptionOption() {
    keyCounter.current += 1;
    setOptions((current) => [
      ...current,
      { ...blankOption(current.length + 1), key: `option-new-${keyCounter.current}` },
    ]);
  }

  function removePrescriptionOption(key: string) {
    setOptions((current) => current.length <= 1 ? current : current.filter((option) => option.key !== key));
  }

  function addMedication(optionKey: string, medication: MedicationCatalogItem) {
    keyCounter.current += 1;
    setOptions((current) => current.map((option) => {
      if (option.key !== optionKey) return option;
      if (option.medicines.some((item) => item.catalogId === medication.id)) {
        return { ...option, search: "" };
      }

      return {
        ...option,
        search: "",
        medicines: [
          ...option.medicines,
          {
            key: `medicine-${keyCounter.current}`,
            catalogId: medication.id,
            medicationName: medication.display_name,
            genericName: medication.generic_name,
            strength: medication.strength,
            dosageForm: medication.dosage_form,
            frequency: "",
            duration: "",
            instructions: "",
          },
        ],
      };
    }));
  }

  function updateMedicine(optionKey: string, medicineKeyValue: string, patch: Partial<DraftMedicine>) {
    setOptions((current) => current.map((option) => {
      if (option.key !== optionKey) return option;
      return {
        ...option,
        medicines: option.medicines.map((medicine) =>
          medicine.key === medicineKeyValue ? { ...medicine, ...patch } : medicine,
        ),
      };
    }));
    setError("");
  }

  function removeMedicine(optionKey: string, medicineKeyValue: string) {
    setOptions((current) => current.map((option) => {
      if (option.key !== optionKey) return option;
      return {
        ...option,
        medicines: option.medicines.filter((medicine) => medicine.key !== medicineKeyValue),
      };
    }));
  }

  function validate() {
    if (!clinicalNote.trim()) return "Add a private clinical note before saving.";
    if (!options.length) return "Add at least one prescription option.";

    for (const [index, option] of options.entries()) {
      if (!option.title.trim()) return `Prescription ${index + 1} needs a title.`;
      if (!option.description.trim()) return `Prescription ${index + 1} needs a patient-facing description.`;
      if (!option.estimatedPrice.trim()) return `Prescription ${index + 1} needs an estimated price.`;
      if (!option.medicines.length) return `Prescription ${index + 1} needs at least one medicine.`;
      for (const medicine of option.medicines) {
        if (!medicine.frequency.trim() || !medicine.duration.trim()) {
          return `${medicine.medicationName} needs frequency and duration.`;
        }
      }
    }
    return "";
  }

  function buildFormData() {
    const data = new FormData();
    data.set("id", consultationId);
    data.set("clinical_note", clinicalNote);
    data.set("options_json", JSON.stringify(options.map((option, index) => ({
      position: index + 1,
      title: option.title.trim(),
      cost_tier: option.costTier,
      description: option.description.trim(),
      estimated_price_inr: option.estimatedPrice.trim(),
      items: option.medicines.map((medicine, medicineIndex) => ({
        position: medicineIndex + 1,
        catalog_id: medicine.catalogId,
        frequency: medicine.frequency.trim(),
        duration: medicine.duration.trim(),
        instructions: medicine.instructions.trim(),
      })),
    }))));
    return data;
  }

  async function save(showStatus = true) {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return false;
    }

    setSaving(true);
    setError("");
    if (showStatus) setStatus("Saving clinical work…");

    const result = await saveTreatmentOptions(buildFormData());
    setSaving(false);

    if (!result.ok) {
      setStatus("");
      setError(result.error || "We couldn’t save the clinical work.");
      return false;
    }

    if (showStatus) {
      setStatus("Clinical work saved.");
      window.setTimeout(() => setStatus(""), 1800);
    }
    return true;
  }

  async function complete() {
    if (completing || saving) return;
    setCompleting(true);
    setStatus("Validating and completing consultation…");
    setError("");

    const saved = await save(false);
    if (!saved) {
      setCompleting(false);
      setStatus("");
      return;
    }

    const result = await completeConsultationNow(consultationId);
    if (!result.ok) {
      setCompleting(false);
      setStatus("");
      setError(result.error || "We couldn’t complete the consultation.");
      return;
    }

    router.replace(`/doctor/consultations/${consultationId}?notice=completed`);
    router.refresh();
  }

  return (
    <div className="clinical-builder">
      <section className="workspace-block clinical-note-block">
        <div className="eyebrow">Private clinician workspace</div>
        <h2>Clinical assessment</h2>
        <p className="form-note">This note remains private to the clinical workspace.</p>
        <textarea
          value={clinicalNote}
          onChange={(event) => { setClinicalNote(event.target.value); setError(""); }}
          rows={7}
          placeholder="Clinical assessment, reasoning, and relevant review notes…"
        />
      </section>

      <section className="workspace-block prescription-options-block">
        <div className="section-row prescription-builder-heading">
          <div>
            <div className="eyebrow">Patient treatment choices</div>
            <h2>Prescription options</h2>
            <p className="form-note">Offer one or more clinically appropriate choices. Price tier is descriptive; explain the actual differences in the option description.</p>
          </div>
          <button type="button" className="button button-secondary add-option-button" onClick={addPrescriptionOption}>
            <Plus size={16} /> Add prescription
          </button>
        </div>

        <div className="treatment-option-editor-list">
          {options.map((option, optionIndex) => {
            const query = option.search.trim().toLowerCase();
            const matches = query
              ? catalog
                  .filter((medication) =>
                    medication.treatment_area === treatmentArea || medication.treatment_area === "general"
                  )
                  .filter((medication) =>
                    [medication.display_name, medication.generic_name, medication.strength, medication.dosage_form]
                      .join(" ")
                      .toLowerCase()
                      .includes(query)
                  )
                  .slice(0, 6)
              : [];

            return (
              <article className="treatment-option-editor" key={option.key}>
                <header className="option-editor-header">
                  <div>
                    <span className="eyebrow">Prescription {optionIndex + 1}</span>
                    <h3>{option.title || `Prescription ${optionIndex + 1}`}</h3>
                  </div>
                  {options.length > 1 && (
                    <button type="button" className="icon-text-button danger" onClick={() => removePrescriptionOption(option.key)}>
                      <Trash2 size={15} /> Remove
                    </button>
                  )}
                </header>

                <div className="option-meta-grid">
                  <label>
                    Option title
                    <input value={option.title} onChange={(event) => updateOption(option.key, { title: event.target.value })} placeholder="e.g. Budget-friendly plan" />
                  </label>
                  <label>
                    Cost position
                    <select value={option.costTier} onChange={(event) => updateOption(option.key, { costTier: event.target.value as DraftOption["costTier"] })}>
                      <option value="budget">Budget</option>
                      <option value="balanced">Balanced</option>
                      <option value="premium">Premium</option>
                      <option value="custom">Custom</option>
                    </select>
                  </label>
                  <label>
                    Estimated total
                    <div className="price-input"><span>₹</span><input type="number" min="0" step="1" value={option.estimatedPrice} onChange={(event) => updateOption(option.key, { estimatedPrice: event.target.value })} placeholder="0" /></div>
                  </label>
                </div>

                <label>
                  Patient-facing explanation
                  <textarea
                    rows={4}
                    value={option.description}
                    onChange={(event) => updateOption(option.key, { description: event.target.value })}
                    placeholder="Explain why this is an appropriate option, what differs from the alternatives, and what the patient should know."
                  />
                </label>

                <div className="medication-search">
                  <label htmlFor={`medicine-search-${option.key}`}>Search medicine inventory</label>
                  <div className="medication-search-box">
                    <Search size={17} />
                    <input
                      id={`medicine-search-${option.key}`}
                      value={option.search}
                      onChange={(event) => updateOption(option.key, { search: event.target.value })}
                      placeholder="Search name, generic, strength, or form"
                      autoComplete="off"
                    />
                    {option.search && <button type="button" aria-label="Clear medicine search" onClick={() => updateOption(option.key, { search: "" })}><X size={15} /></button>}
                  </div>

                  {matches.length > 0 && (
                    <div className="medication-search-results">
                      {matches.map((medication) => (
                        <button type="button" key={medication.id} onClick={() => addMedication(option.key, medication)}>
                          <span>
                            <strong>{medication.display_name}</strong>
                            <small>{medication.generic_name} · {medication.strength} · {medication.dosage_form}</small>
                          </span>
                          <span className="catalog-add"><Plus size={14} /> Add</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="selected-medication-list">
                  {option.medicines.length ? option.medicines.map((medicine, medicineIndex) => (
                    <fieldset className="selected-medication" key={medicine.key}>
                      <legend>Medicine {medicineIndex + 1}</legend>
                      <div className="selected-medication-title">
                        <div>
                          <strong>{medicine.medicationName}</strong>
                          <span>{medicine.genericName} · {medicine.strength} · {medicine.dosageForm}</span>
                        </div>
                        <button type="button" aria-label={`Remove ${medicine.medicationName}`} onClick={() => removeMedicine(option.key, medicine.key)}><X size={16} /></button>
                      </div>
                      <div className="medicine-instruction-grid">
                        <label>Frequency<input value={medicine.frequency} onChange={(event) => updateMedicine(option.key, medicine.key, { frequency: event.target.value })} placeholder="e.g. Once daily" /></label>
                        <label>Duration<input value={medicine.duration} onChange={(event) => updateMedicine(option.key, medicine.key, { duration: event.target.value })} placeholder="e.g. 30 days" /></label>
                        <label className="wide">Instructions<input value={medicine.instructions} onChange={(event) => updateMedicine(option.key, medicine.key, { instructions: event.target.value })} placeholder="Patient instructions" /></label>
                      </div>
                    </fieldset>
                  )) : (
                    <div className="medicine-empty-state">
                      <Search size={19} />
                      <span>Search the inventory above and add at least one medicine.</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {error && <p className="page-error" role="alert">{error}</p>}
      {status && <p className="page-notice" role="status">{status}</p>}

      <footer className="clinical-builder-actions">
        <button type="button" className="button button-secondary" onClick={() => void save(true)} disabled={saving || completing}>
          {saving ? <><LoaderCircle size={16} className="action-spinner" /> Saving…</> : "Save clinical work"}
        </button>
        <button type="button" className="button button-primary motion-cta" onClick={() => void complete()} disabled={saving || completing}>
          {completing ? <><LoaderCircle size={16} className="action-spinner" /> Completing…</> : <><CheckCircle2 size={16} /> Complete consultation</>}
        </button>
      </footer>
    </div>
  );
}
