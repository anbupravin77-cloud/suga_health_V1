import { redirect } from "next/navigation";

export const metadata = { title: "New consultation | Suga.Health" };

export default function NewConsultationPage() {
  redirect("/consultation/start");
}
