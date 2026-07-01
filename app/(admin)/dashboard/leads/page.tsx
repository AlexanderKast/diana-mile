import LeadsTable from "@/components/admin/LeadsTable";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import type { Lead } from "@/types";

export const metadata = {
  title: "Leads | Diana Mile Admin",
};

export default async function LeadsPage() {
  const supabase = createAdminSupabaseClient();

  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const leads = (data ?? []) as Lead[];

  return (
    <div>
      <h1 className="font-display text-2xl text-carbon mb-6">Leads</h1>
      <LeadsTable leads={leads} />
    </div>
  );
}
