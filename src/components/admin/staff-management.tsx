"use client";

import { Check, Eye, EyeOff, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type StaffRow = {
  id: string;
  email: string;
  role: "doctor" | "pharmacist";
  active: boolean;
  onboarding_status: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  specialties: string[] | null;
  created_at: string;
};

type StaffRole = StaffRow["role"];

const specialtyOptions = [
  { value: "weight", label: "Medical weight loss" },
  { value: "hair", label: "Hair growth" },
  { value: "sex", label: "Sexual health" },
] as const;

function displayName(staff: StaffRow) {
  return [staff.first_name, staff.last_name].filter(Boolean).join(" ").trim() || staff.email;
}

function specialtyLabel(value: string) {
  return specialtyOptions.find((item) => item.value === value)?.label || value;
}

function emptyForm() {
  return { name: "", age: "", email: "", password: "", specialties: [] as string[] };
}

export function StaffManagement({ role, initialStaff }: { role: StaffRole; initialStaff: StaffRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"form" | "confirm" | "profile" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState<StaffRow | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const noun = role === "doctor" ? "Doctor" : "Pharmacist";

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return initialStaff;
    return initialStaff.filter((staff) =>
      `${displayName(staff)} ${staff.email}`.toLowerCase().includes(needle),
    );
  }, [initialStaff, query]);

  function openAdd() {
    setForm(emptyForm());
    setSelected(null);
    setShowPassword(false);
    setError("");
    setModal("form");
  }

  function toggleSpecialty(value: string) {
    setForm((current) => ({
      ...current,
      specialties: current.specialties.includes(value)
        ? current.specialties.filter((item) => item !== value)
        : [...current.specialties, value],
    }));
  }

  function proceedToConfirm() {
    const age = Number(form.age);
    if (form.name.trim().length < 2) return setError("Enter the staff member's full name.");
    if (!Number.isInteger(age) || age < 18 || age > 100) return setError("Enter an age between 18 and 100.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Enter a valid email address.");
    if (form.password.length < 8) return setError("Use a password with at least 8 characters.");
    if (role === "doctor" && form.specialties.length === 0) return setError("Choose at least one treatment field.");
    setError("");
    setModal("confirm");
  }

  async function createStaff() {
    setSaving(true);
    setError("");

    const supabase = createClient();
    const { data, error: invokeError } = await supabase.functions.invoke("admin-create-staff", {
      body: {
        role,
        name: form.name.trim(),
        age: Number(form.age),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        specialties: role === "doctor" ? form.specialties : [],
      },
    });

    setSaving(false);

    if (invokeError || data?.error) {
      setError(data?.error || invokeError?.message || `Unable to create the ${noun.toLowerCase()} account.`);
      return;
    }

    if (!data?.staff) {
      setError(`The ${noun.toLowerCase()} account response was incomplete.`);
      return;
    }

    setSelected(data.staff as StaffRow);
    setForm(emptyForm());
    setModal("profile");
    router.refresh();
  }

  function openProfile(staff: StaffRow) {
    setSelected(staff);
    setError("");
    setModal("profile");
  }

  return (
    <>
      <section className="staff-directory" aria-label={`${noun} directory`}>
        <div className="staff-toolbar">
          <label className="staff-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search {noun.toLowerCase()}s</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${noun.toLowerCase()}s by name or email`}
            />
          </label>

          <button type="button" className="button button-primary staff-add-button" onClick={openAdd}>
            <Plus size={16} /> Add {noun}
          </button>
        </div>

        <div className="staff-list-meta">
          <span>{filtered.length} {filtered.length === 1 ? noun.toLowerCase() : `${noun.toLowerCase()}s`}</span>
          <span>Active Suga.Health staff accounts</span>
        </div>

        <div className={role === "doctor" ? "staff-table" : "staff-table staff-table-pharmacist"}>
          <div className="staff-table-head">
            <span>Name</span>
            <span>Email</span>
            {role === "doctor" && <span>Treatment fields</span>}
            <span>Status</span>
            <span aria-hidden="true" />
          </div>

          {filtered.length ? filtered.map((staff) => (
            <button type="button" className="staff-table-row" key={staff.id} onClick={() => openProfile(staff)}>
              <strong>{displayName(staff)}</strong>
              <span>{staff.email}</span>
              {role === "doctor" && (
                <span className="staff-specialty-summary">
                  {(staff.specialties ?? []).map(specialtyLabel).join(" · ") || "Not assigned"}
                </span>
              )}
              <span className={staff.active ? "staff-status is-active" : "staff-status"}>{staff.active ? "Active" : "Inactive"}</span>
              <span className="staff-view-link">View</span>
            </button>
          )) : (
            <div className="staff-empty">
              <strong>No {noun.toLowerCase()}s found.</strong>
              <span>{query ? "Try a different name or email." : `Create the first ${noun.toLowerCase()} account.`}</span>
            </div>
          )}
        </div>
      </section>

      {modal && (
        <div
          className="staff-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target && !saving) setModal(null);
          }}
        >
          <section className="staff-modal" role="dialog" aria-modal="true" aria-labelledby="staff-modal-title">
            <button type="button" className="staff-modal-close" onClick={() => !saving && setModal(null)} aria-label="Close">
              <X size={18} />
            </button>

            {modal === "form" && (
              <>
                <div className="staff-modal-heading">
                  <span className="eyebrow">New staff account</span>
                  <h2 id="staff-modal-title">Add {noun}</h2>
                  <p>The email and password entered here will be the credentials used to sign in.</p>
                </div>

                {error && <p className="page-error" role="alert">{error}</p>}

                <div className="staff-form-grid">
                  <label>
                    <span>{noun} name</span>
                    <input
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      placeholder={role === "doctor" ? "Dr. Full Name" : "Full Name"}
                      autoFocus
                    />
                  </label>

                  <label>
                    <span>Age</span>
                    <input
                      type="number"
                      min={18}
                      max={100}
                      value={form.age}
                      onChange={(event) => setForm({ ...form, age: event.target.value })}
                      placeholder="35"
                    />
                  </label>

                  <label className="wide">
                    <span>Email ID</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      placeholder="name@example.com"
                      autoComplete="off"
                    />
                  </label>

                  <label className="wide">
                    <span>Account password</span>
                    <div className="staff-password-field">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(event) => setForm({ ...form, password: event.target.value })}
                        placeholder="Minimum 8 characters"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </label>

                  {role === "doctor" && (
                    <fieldset className="staff-specialties wide">
                      <legend>Treatment fields</legend>
                      <p>Select one or more fields. A doctor can work across multiple Suga.Health treatment areas.</p>
                      <div className="staff-specialty-grid">
                        {specialtyOptions.map((option) => {
                          const checked = form.specialties.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              className={checked ? "staff-specialty-option is-selected" : "staff-specialty-option"}
                              onClick={() => toggleSpecialty(option.value)}
                              aria-pressed={checked}
                            >
                              <span>{option.label}</span>
                              {checked && <Check size={15} />}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  )}
                </div>

                <div className="staff-modal-actions">
                  <button type="button" className="button button-secondary" onClick={() => setModal(null)}>Cancel</button>
                  <button type="button" className="button button-primary" onClick={proceedToConfirm}>Review account</button>
                </div>
              </>
            )}

            {modal === "confirm" && (
              <>
                <div className="staff-modal-heading">
                  <span className="eyebrow">Confirm details</span>
                  <h2 id="staff-modal-title">Create this {noun.toLowerCase()} account?</h2>
                  <p>After creation, these credentials can immediately be used on the Suga.Health sign-in page.</p>
                </div>

                {error && <p className="page-error" role="alert">{error}</p>}

                <dl className="staff-confirm-list">
                  <div><dt>Name</dt><dd>{form.name}</dd></div>
                  <div><dt>Age</dt><dd>{form.age}</dd></div>
                  <div><dt>Email</dt><dd>{form.email}</dd></div>
                  <div><dt>Password</dt><dd>{"•".repeat(Math.max(8, Math.min(form.password.length, 12)))}</dd></div>
                  {role === "doctor" && <div><dt>Treatment fields</dt><dd>{form.specialties.map(specialtyLabel).join(", ")}</dd></div>}
                </dl>

                <div className="staff-modal-actions">
                  <button type="button" className="button button-secondary" disabled={saving} onClick={() => setModal("form")}>Back</button>
                  <button type="button" className="button button-primary" disabled={saving} onClick={createStaff}>
                    {saving ? "Creating account…" : `Confirm & create ${noun.toLowerCase()}`}
                  </button>
                </div>
              </>
            )}

            {modal === "profile" && selected && (
              <>
                <div className="staff-modal-heading">
                  <span className="eyebrow">{selected.active ? "Active account" : "Staff profile"}</span>
                  <h2 id="staff-modal-title">{displayName(selected)}</h2>
                  <p>{selected.role === "doctor" ? "Doctor profile" : "Pharmacist profile"} · Suga.Health staff access</p>
                </div>

                <div className="staff-profile-card">
                  <div><span>Email</span><strong>{selected.email}</strong></div>
                  <div><span>Age</span><strong>{selected.age ?? "—"}</strong></div>
                  <div><span>Account status</span><strong>{selected.active ? "Active" : "Inactive"}</strong></div>
                  {selected.role === "doctor" && (
                    <div className="wide">
                      <span>Treatment fields</span>
                      <strong>{(selected.specialties ?? []).map(specialtyLabel).join(" · ") || "Not assigned"}</strong>
                    </div>
                  )}
                </div>

                <div className="staff-profile-ready">
                  <Check size={18} />
                  <div>
                    <strong>Account ready</strong>
                    <span>This staff member can sign in using the configured email and password.</span>
                  </div>
                </div>

                <div className="staff-modal-actions">
                  <button type="button" className="button button-primary" onClick={() => setModal(null)}>Done</button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
