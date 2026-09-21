export default function PatientLoading() {
  return (
    <div className="patient-route-loading" role="status" aria-live="polite">
      <div className="patient-route-loading-line" />
      <span>Loading your care space…</span>
    </div>
  );
}
