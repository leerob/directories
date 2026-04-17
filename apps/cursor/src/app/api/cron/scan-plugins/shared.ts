import "server-only";

import type { NextRequest } from "next/server";

export function requireCronAuth(req: NextRequest): Response | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new Response("Missing CRON_SECRET", { status: 500 });
  }

  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;

  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically.
  if (header !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  return null;
}

export const PLUGIN_SCAN_BATCH_SIZE = Math.max(
  1,
  Number.parseInt(process.env.PLUGIN_SCAN_BATCH_SIZE ?? "", 10) || 5,
);
