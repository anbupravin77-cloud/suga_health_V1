import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageSquare } from "lucide-react";

export function patientCareTitle(value: string) {
  const labels: Record<string, string> = {
    weight: "Weight Loss Consultation",
    weight_loss: "Weight Loss Consultation",
    hair: "Hair Growth Consultation",
    hair_growth: "Hair Growth Consultation",
    sex: "Sexual Health Consultation",
    sexual_health: "Sexual Health Consultation",
  };
  if (labels[value]) return labels[value];
  const title = value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase()).trim();
  return title ? (title.toLowerCase().endsWith("consultation") ? title : `${title} Consultation`) : "Consultation";
}

export function doctorInitials(name: string) {
  return name
    .replace(/^Dr\.?\s*/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "DR";
}

export type PatientConversation = {
  id: string;
  consultationId: string;
  concern: string;
  doctorName: string;
  assigned: boolean;
  doctorSpecialization?: string | null;
};

export function PatientConversationCard({
  conversation,
  href,
}: {
  conversation: PatientConversation;
  href: string;
}) {
  const title = patientCareTitle(conversation.concern);
  return (
    <Link
      href={href}
      className="patient-conversation-card"
      aria-label={`Open ${title} conversation. ${conversation.doctorName}.`}
    >
      <strong className="patient-conversation-title">{title}</strong>
      <span className="patient-conversation-detail">
        <span className="patient-conversation-avatar" aria-hidden="true">
          {conversation.assigned ? doctorInitials(conversation.doctorName) : <MessageSquare size={17} />}
        </span>
        <span className="patient-conversation-doctor">
          <small>{conversation.assigned ? "Assigned doctor" : "Doctor assignment"}</small>
          <b>{conversation.doctorName}</b>
        </span>
        <span className="patient-conversation-open" aria-hidden="true">
          <ArrowUpRight size={17} />
        </span>
      </span>
    </Link>
  );
}

export function PatientConversationsHeading({ showViewAll = false }: { showViewAll?: boolean }) {
  return (
    <div className="patient-conversations-heading">
      <div>
        <span className="patient-conversations-eyebrow">PRIVATE COMMUNICATION</span>
        <h2 id="patient-conversations-title">Your care conversations.</h2>
        <p>All your doctor conversations, organized by consultation. Select one to view messages.</p>
      </div>
      {showViewAll && (
        <Link href="/patient/messages" className="patient-conversations-view-all">
          View all <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
