import {
  identifierSchema,
  removeAmbassadorByIdentifier,
} from "@/data/ambassadors";
import { requireAmbassadorsSecret } from "@/utils/api-auth";
import { createClient } from "@/utils/supabase/admin-client";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> },
) {
  const unauthorized = requireAmbassadorsSecret(request);
  if (unauthorized) return unauthorized;

  const { identifier: raw } = await params;
  const identifier = decodeURIComponent(raw);

  const parsed = identifierSchema.safeParse(identifier);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Identifier must be a UUID (user id) or a valid email",
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient();
    const result = await removeAmbassadorByIdentifier(supabase, parsed.data);

    return NextResponse.json(
      { ok: true, ...result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
