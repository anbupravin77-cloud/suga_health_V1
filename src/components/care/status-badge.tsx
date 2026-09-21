const labels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  assigned: "Waiting for doctor",
  under_review: "Under review",
  completed: "Completed",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge status-${status}`}>{labels[status] ?? status}</span>;
}
