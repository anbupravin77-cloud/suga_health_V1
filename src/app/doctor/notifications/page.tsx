import { NotificationsList } from "@/components/care/notifications-list";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DoctorNotificationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, related_entity_id, related_entity_type, title, short_message, status, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(80);

  return <NotificationsList role="doctor" initialItems={data ?? []} />;
}
