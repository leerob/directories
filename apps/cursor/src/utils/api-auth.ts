import { type NextRequest, NextResponse } from "next/server";

function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function requireAmbassadorsSecret(
  request: NextRequest,
): NextResponse | null {
  const secret = process.env.AMBASSADORS_API_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Server misconfigured: AMBASSADORS_API_SECRET not set" },
      { status: 500 },
    );
  }

  const header = request.headers.get("authorization");
  const expected = `Bearer ${secret}`;

  if (!header || !timingSafeEqualStrings(header, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
