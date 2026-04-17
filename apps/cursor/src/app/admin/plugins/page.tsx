import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getFlaggedPlugins,
  getPendingPlugins,
  getScanningPlugins,
} from "@/data/queries";
import { isAdmin } from "@/utils/admin";
import { getSession } from "@/utils/supabase/auth";
import { PluginReviewTabs } from "./plugin-review-tabs";

export const metadata: Metadata = {
  title: "Review Plugins | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminPluginsPage() {
  const session = await getSession();

  if (!session || !isAdmin(session.user.id)) {
    redirect("/");
  }

  const [pendingRes, flaggedRes, scanningRes] = await Promise.all([
    getPendingPlugins({ since: "2026-03-16T00:00:00Z" }),
    getFlaggedPlugins(),
    getScanningPlugins(),
  ]);

  const pending = (pendingRes.data ?? []).filter(
    (p) => p.review_status !== "flagged" && p.review_status !== "scanning",
  );

  return (
    <div className="min-h-screen px-6 pt-24 md:pt-32 pb-32">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10">
          <h1 className="marketing-page-title mb-3">Review Plugins</h1>
          <p className="marketing-copy text-muted-foreground">
            {pending.length} pending · {flaggedRes.data.length} flagged ·{" "}
            {scanningRes.data.length} scanning
          </p>
        </div>

        <PluginReviewTabs
          pending={pending}
          flagged={flaggedRes.data}
          scanning={scanningRes.data}
        />
      </div>
    </div>
  );
}
