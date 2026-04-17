import type { NextRequest } from "next/server";
import { decideVerdict } from "@/lib/plugin-review-policy";
import { pollPluginScan } from "@/lib/plugin-reviewer";
import { createClient } from "@/utils/supabase/admin-client";
import { PLUGIN_SCAN_BATCH_SIZE, requireCronAuth } from "../shared";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const unauth = requireCronAuth(req);
  if (unauth) return unauth;

  const supabase = await createClient();

  const { data: running, error } = await supabase
    .from("plugin_scans")
    .select("id, plugin_id, agent_id, run_id, started_at")
    .eq("status", "running")
    .order("started_at", { ascending: true })
    .limit(PLUGIN_SCAN_BATCH_SIZE * 3); // poll more than we start each tick

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  const results: Array<{
    scanId: string;
    state: "pending" | "finished" | "error";
    decision?: string;
  }> = [];

  for (const scan of running ?? []) {
    if (!scan.agent_id || !scan.run_id) continue;

    try {
      const result = await pollPluginScan({
        agentId: scan.agent_id,
        runId: scan.run_id,
      });

      if (result.state === "pending") {
        results.push({ scanId: scan.id, state: "pending" });
        continue;
      }

      if (result.state === "error") {
        await supabase
          .from("plugin_scans")
          .update({
            status: "error",
            error: result.error,
            finished_at: new Date().toISOString(),
          })
          .eq("id", scan.id);

        // Return the plugin to pending so it stays in the manual queue
        // rather than getting stuck in `scanning`.
        await supabase
          .from("plugins")
          .update({ review_status: "pending" })
          .eq("id", scan.plugin_id);

        results.push({ scanId: scan.id, state: "error" });
        continue;
      }

      const { verdict } = result;

      const { data: plugin } = await supabase
        .from("plugins")
        .select("id, slug, active")
        .eq("id", scan.plugin_id)
        .single();

      const decision = decideVerdict(verdict, {
        wasActive: Boolean(plugin?.active),
      });

      await supabase
        .from("plugin_scans")
        .update({
          status: "finished",
          verdict,
          security_score: verdict.security_score,
          quality_score: verdict.quality_score,
          recommendation: verdict.recommendation,
          finished_at: new Date().toISOString(),
        })
        .eq("id", scan.id);

      await supabase
        .from("plugins")
        .update({
          active: decision.active,
          review_status: decision.review_status,
          security_score: verdict.security_score,
          quality_score: verdict.quality_score,
          review_summary: verdict.summary,
          flagged_reasons: verdict.flags,
          last_scanned_at: new Date().toISOString(),
        })
        .eq("id", scan.plugin_id);

      results.push({
        scanId: scan.id,
        state: "finished",
        decision: decision.review_status,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await supabase
        .from("plugin_scans")
        .update({
          status: "error",
          error: message,
          finished_at: new Date().toISOString(),
        })
        .eq("id", scan.id);
      await supabase
        .from("plugins")
        .update({ review_status: "pending" })
        .eq("id", scan.plugin_id);
      results.push({ scanId: scan.id, state: "error" });
    }
  }

  return Response.json({ ok: true, polled: results });
}
