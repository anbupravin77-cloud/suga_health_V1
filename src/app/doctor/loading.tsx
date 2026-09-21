export default function DoctorLoading() {
  return (
    <div className="portal-loading" role="status" aria-live="polite">
      <div className="portal-loading-heading" />
      <div className="portal-loading-line" />
      <div className="portal-loading-grid">
        <div /><div /><div />
      </div>
      <span>Opening clinical workspace…</span>
    </div>
  );
}
