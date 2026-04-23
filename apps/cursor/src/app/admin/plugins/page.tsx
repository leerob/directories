import { getDeclinedPlugins, getPendingPlugins } from "@/data/queries";
import { isAdmin } from "@/utils/admin";
import { getSession } from "@/utils/supabase/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PluginReviewTabs } from "./plugin-review-tabs";

export const metadata: Metadata = {
  title: "Review Plugins | Admin",
};

export default async function AdminPluginsPage() {
  const session = await getSession();

  if (!session || !isAdmin(session.user.id)) {
    redirect("/");
  }

  const [{ data: plugins }, { data: declined }] = await Promise.all([
    getPendingPlugins({ since: "2026-03-16T00:00:00Z" }),
    getDeclinedPlugins({ since: "2026-03-16T00:00:00Z" }),
  ]);

  return (
    <div className="min-h-screen px-6 pt-24 md:pt-32 pb-32">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10">
          <h1 className="marketing-page-title mb-3">Review Plugins</h1>
        </div>

        <PluginReviewTabs
          pending={plugins ?? []}
          declined={declined ?? []}
        />
      </div>
    </div>
  );
}
