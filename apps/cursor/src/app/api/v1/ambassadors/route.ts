import {
  addAmbassadorByEmail,
  emailSchema,
  listAmbassadors,
} from "@/data/ambassadors";
import { requireAmbassadorsSecret } from "@/utils/api-auth";
import { createClient } from "@/utils/supabase/admin-client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const unauthorized = requireAmbassadorsSecret(request);
  if (unauthorized) return unauthorized;

  try {
    const supabase = await createClient();
    const { ambassadors, pending } = await listAmbassadors(supabase);

    return NextResponse.json(
      {
        count: ambassadors.length,
        ambassadors,
        pending,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const postBodySchema = z.union([
  z.object({ email: emailSchema }),
  z.object({ emails: z.array(emailSchema).min(1).max(500) }),
]);

export async function POST(request: NextRequest) {
  const unauthorized = requireAmbassadorsSecret(request);
  if (unauthorized) return unauthorized;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = postBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const emails =
    "emails" in parsed.data ? parsed.data.emails : [parsed.data.email];

  try {
    const supabase = await createClient();
    const results = await Promise.all(
      emails.map(async (email) => {
        try {
          const result = await addAmbassadorByEmail(supabase, email);
          return result;
        } catch (err) {
          return {
            status: "error" as const,
            email,
            error: err instanceof Error ? err.message : "Unknown error",
          };
        }
      }),
    );

    return NextResponse.json(
      { count: results.length, results },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
