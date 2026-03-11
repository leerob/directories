import WelcomeEmail from "@/emails/templates/welcome";
import { getResend } from "@/lib/resend";
import { createClient } from "@/utils/supabase/server";
import { waitUntil } from "@vercel/functions";
import { differenceInSeconds } from "date-fns";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (
        data?.session?.user.created_at &&
        differenceInSeconds(
          new Date(),
          new Date(data.session.user.created_at),
        ) < 20
      ) {
        const resend = getResend();
        if (resend) {
          waitUntil(
            resend.emails.send({
              from: "Cursor Directory <hello@transactional.cursor.directory>",
              to: data.session.user.email!,
              subject: "Welcome to Cursor Directory",
              react: WelcomeEmail({
                name: data.session.user.user_metadata.full_name,
              }),
            }),
          );
        }
      }

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
