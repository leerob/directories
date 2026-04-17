import type { NextRequest } from "next/server";
import type { PluginRow } from "@/data/queries";
import { startPluginScan } from "@/lib/plugin-reviewer";
import { createClient } from "@/utils/supabase/admin-client";
import { PLUGIN_SCAN_BATCH_SIZE, requireCronAuth } from "../shared";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const unauth = requireCronAuth(req);
  if (unauth) return unauth;

  const supabase = await createClient();

  // Oldest queued scans first so new submissions don't starve re-scans.
  const { data: queued, error } = await supabase
    .from("plugin_scans")
    .select("id, plugin_id")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(PLUGIN_SCAN_BATCH_SIZE);

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  const results: Array<{ scanId: string; ok: boolean; error?: string }> = [];

  for (const scan of queued ?? []) {
    const { data: plugin, error: pluginError } = await supabase
      .from("plugins")
      .select("*, plugin_components(*)")
      .eq("id", scan.plugin_id)
      .single();

    if (pluginError || !plugin) {
      await supabase
        .from("plugin_scans")
        .update({
          status: "error",
          error: pluginError?.message ?? "Plugin not found",
          finished_at: new Date().toISOString(),
        })
        .eq("id", scan.id);
      results.push({
        scanId: scan.id,
        ok: false,
        error: pluginError?.message ?? "not_found",
      });
      continue;
    }

    try {
      const { agentId, runId } = await startPluginScan(plugin as PluginRow);

      const startedAt = new Date().toISOString();
      const [scanUpdate, pluginUpdate] = await Promise.all([
        supabase
          .from("plugin_scans")
          .update({
            status: "running",
            agent_id: agentId,
            run_id: runId,
            started_at: startedAt,
          })
          .eq("id", scan.id),
        supabase
          .from("plugins")
          .update({ review_status: "scanning" })
          .eq("id", scan.plugin_id),
      ]);

      if (scanUpdate.error || pluginUpdate.error) {
        console.error(
          "Failed to persist scan start",
          scanUpdate.error ?? pluginUpdate.error,
        );
      }

      results.push({ scanId: scan.id, ok: true });
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
      results.push({ scanId: scan.id, ok: false, error: message });
    }
  }

  return Response.json({ ok: true, started: results });
}
