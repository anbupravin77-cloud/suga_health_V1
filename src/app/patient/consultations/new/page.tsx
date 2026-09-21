import { ConsultationForm } from "@/components/care/consultation-form";

export const metadata = { title: "Start consultation" };

export default async function NewConsultationPage() {
  return <>
    <section className="dashboard-heading compact-heading"><div><span className="eyebrow">Private consultation</span><h1>Tell us what’s going on.</h1><p>A real doctor will review the details you submit.</p></div></section>
    <ConsultationForm />
  </>;
}
