import { listAmbassadors } from "@/data/ambassadors";
import { isAdmin } from "@/utils/admin";
import { createClient } from "@/utils/supabase/admin-client";
import { getSession } from "@/utils/supabase/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AmbassadorManager } from "./ambassador-manager";

export const metadata: Metadata = {
  title: "Manage Ambassadors | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminAmbassadorsPage() {
  const session = await getSession();

  if (!session || !isAdmin(session.user.id)) {
    redirect("/");
  }

  const supabase = await createClient();
  const { ambassadors, pending } = await listAmbassadors(supabase);

  return (
    <div className="min-h-screen px-6 pt-24 md:pt-32 pb-32">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10">
          <h1 className="marketing-page-title mb-3">Manage Ambassadors</h1>
          <p className="marketing-copy text-muted-foreground">
            {ambassadors.length}{" "}
            {ambassadors.length === 1 ? "ambassador" : "ambassadors"}
            {pending.length > 0 ? `, ${pending.length} pending` : ""}
          </p>
        </div>

        <AmbassadorManager ambassadors={ambassadors} pending={pending} />
      </div>
    </div>
  );
}
