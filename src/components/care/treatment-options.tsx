"use client";

import { ArrowRight, Check, LoaderCircle, Pill } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { selectTreatmentOption } from "@/app/actions";

export type PatientTreatmentOption = {
  id: string;
  position: number;
  title: string;
  cost_tier: string;
  description: string;
  estimated_price_inr: number | null;
  consultation_prescription_option_items: Array<{
    id: string;
    position: number;
    medication_name: string;
    strength: string;
    dosage_form: string;
    frequency: string;
    duration: string;
    instructions: string | null;
  }>;
};

const tierLabel: Record<string, string> = {
  budget: "Budget option",
  balanced: "Balanced option",
  premium: "Premium option",
  custom: "Doctor-designed option",
};

export function TreatmentOptions({
  options,
  selectedId,
}: {
  options: PatientTreatmentOption[];
  selectedId: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(selectedId);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function choose(optionId: string) {
    if (pendingId) return;
    setPendingId(optionId);
    setError("");
    const previous = selected;
    setSelected(optionId);

    const result = await selectTreatmentOption(optionId);
    if (!result.ok) {
      setSelected(previous);
      setError(result.error || "We couldn’t save your treatment choice.");
      setPendingId(null);
      return;
    }

    setPendingId(null);
    router.refresh();
  }

  return (
    <section className="patient-treatment-options">
      <div className="treatment-options-heading">
        <div>
          <span className="eyebrow">Doctor-prescribed choices</span>
          <h2>Choose the treatment plan that fits you.</h2>
          <p>Your doctor has prepared these clinically appropriate options. Compare the medicines, explanation, and estimated cost before choosing.</p>
        </div>
      </div>

      {error && <p className="page-error" role="alert">{error}</p>}

      <div className="patient-option-grid">
        {options.map((option) => {
          const isSelected = selected === option.id;
          const items = [...(option.consultation_prescription_option_items ?? [])].sort((a, b) => a.position - b.position);

          return (
            <article className={isSelected ? "patient-option-card selected" : "patient-option-card"} aria-label={option.title} key={option.id}>
              <header>
                <div>
                  <span className="option-tier">{tierLabel[option.cost_tier] || tierLabel.custom}</span>
                  <h3>{option.title}</h3>
                </div>
                {isSelected && <span className="selected-badge"><Check size={14} /> Selected</span>}
              </header>

              <p className="option-description">{option.description}</p>

              <div className="option-price">
                <span>Estimated treatment cost</span>
                <strong>{option.estimated_price_inr == null ? "Price pending" : `₹${Number(option.estimated_price_inr).toLocaleString("en-IN")}`}</strong>
              </div>

              <div className="option-medicine-list">
                {items.map((item) => (
                  <div className="option-medicine" key={item.id}>
                    <Pill size={17} />
                    <div>
                      <strong>{item.medication_name}</strong>
                      <span>{item.strength} · {item.dosage_form}</span>
                      <dl className="medicine-directions"><div><dt>Frequency</dt><dd>{item.frequency}</dd></div><div><dt>Duration</dt><dd>{item.duration}</dd></div>{item.instructions && <div className="wide"><dt>Instructions</dt><dd>{item.instructions}</dd></div>}</dl>
                    </div>
                  </div>
                ))}
              </div>

              <div className="option-card-actions">
                {isSelected ? (
                  <>
                    <button type="button" className="button button-secondary selected-option-button" disabled>
                      <Check size={16} /> Treatment selected
                    </button>
                    <button type="button" className="button button-primary checkout-placeholder" disabled title="Payment integration will be added in the next phase">
                      Checkout coming next <ArrowRight size={16} />
                    </button>
                  </>
                ) : (
                  <button type="button" className="button button-primary motion-cta" onClick={() => void choose(option.id)} disabled={Boolean(pendingId)}>
                    {pendingId === option.id ? <><LoaderCircle size={16} className="action-spinner" /> Saving choice…</> : <>Choose this option <ArrowRight size={16} /></>}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
