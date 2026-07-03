import { redirect } from "next/navigation";
import { requireAdminSession } from "@diana-mile/shared/supabase/server";
import Sidebar from "@/components/admin/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await requireAdminSession())) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-crema">
      <Sidebar />
      <main className="md:ml-56 min-h-screen bg-crema p-6 pt-20 md:pt-6">
        {children}
      </main>
    </div>
  );
}
