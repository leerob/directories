import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

const AMBASSADOR_PROFILE_FIELDS =
  "id, email, name, slug, image, bio, website, social_x_link, follower_count, created_at" as const;

export const emailSchema = z.string().trim().toLowerCase().email();

export const userIdSchema = z.string().uuid();

export const identifierSchema = z.union([userIdSchema, emailSchema]);

export type AmbassadorProfile = {
  id: string;
  email: string;
  name: string;
  slug: string | null;
  image: string | null;
  bio: string | null;
  website: string | null;
  social_x_link: string | null;
  follower_count: number | null;
  created_at: string;
};

export type PendingAmbassadorEmail = {
  email: string;
  created_at: string;
};

export type AddAmbassadorResult =
  | { status: "promoted"; email: string; user: AmbassadorProfile }
  | { status: "already"; email: string; user: AmbassadorProfile }
  | { status: "pending"; email: string };

export type RemoveAmbassadorResult = {
  removed: { userId?: string; email?: string; pending: boolean };
};

function parseEmail(value: string): string {
  const result = emailSchema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `Invalid email: ${result.error.issues[0]?.message ?? "unknown error"}`,
    );
  }
  return result.data;
}

function parseUserId(value: string): string {
  const result = userIdSchema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `Invalid user id: ${result.error.issues[0]?.message ?? "unknown error"}`,
    );
  }
  return result.data;
}

export async function listAmbassadors(supabase: SupabaseClient): Promise<{
  ambassadors: AmbassadorProfile[];
  pending: PendingAmbassadorEmail[];
}> {
  const [ambassadorsRes, pendingRes] = await Promise.all([
    supabase
      .from("users")
      .select(AMBASSADOR_PROFILE_FIELDS)
      .eq("is_ambassador", true)
      .order("name", { ascending: true }),
    supabase
      .from("pending_ambassador_emails")
      .select("email, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (ambassadorsRes.error) {
    throw new Error(
      `Failed to list ambassadors: ${ambassadorsRes.error.message}`,
    );
  }
  if (pendingRes.error) {
    throw new Error(
      `Failed to list pending ambassadors: ${pendingRes.error.message}`,
    );
  }

  return {
    ambassadors: (ambassadorsRes.data ?? []) as AmbassadorProfile[],
    pending: (pendingRes.data ?? []) as PendingAmbassadorEmail[],
  };
}

export async function addAmbassadorByEmail(
  supabase: SupabaseClient,
  rawEmail: string,
  createdBy?: string,
): Promise<AddAmbassadorResult> {
  const email = parseEmail(rawEmail);
  const validatedCreatedBy =
    createdBy !== undefined ? parseUserId(createdBy) : null;

  const { data: existing, error: findError } = await supabase
    .from("users")
    .select(`${AMBASSADOR_PROFILE_FIELDS}, is_ambassador`)
    .ilike("email", email)
    .maybeSingle();

  if (findError) {
    throw new Error(`Failed to look up user: ${findError.message}`);
  }

  if (existing) {
    const alreadyAmbassador = Boolean(
      (existing as { is_ambassador?: boolean }).is_ambassador,
    );

    if (!alreadyAmbassador) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ is_ambassador: true })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(
          `Failed to mark user as ambassador: ${updateError.message}`,
        );
      }
    }

    const { is_ambassador: _ignored, ...profile } = existing as {
      is_ambassador?: boolean;
    } & AmbassadorProfile;

    await supabase
      .from("pending_ambassador_emails")
      .delete()
      .eq("email", email);

    return {
      status: alreadyAmbassador ? "already" : "promoted",
      email,
      user: profile as AmbassadorProfile,
    };
  }

  const { error: insertError } = await supabase
    .from("pending_ambassador_emails")
    .upsert(
      { email, created_by: validatedCreatedBy },
      { onConflict: "email", ignoreDuplicates: false },
    );

  if (insertError) {
    throw new Error(
      `Failed to queue pending ambassador: ${insertError.message}`,
    );
  }

  return { status: "pending", email };
}

export async function removeAmbassadorByUserId(
  supabase: SupabaseClient,
  rawUserId: string,
): Promise<RemoveAmbassadorResult> {
  const userId = parseUserId(rawUserId);

  const { data, error } = await supabase
    .from("users")
    .update({ is_ambassador: false })
    .eq("id", userId)
    .select("id, email")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to revoke ambassador: ${error.message}`);
  }

  if (!data) {
    return { removed: { pending: false } };
  }

  let pendingRemoved = false;
  if (data.email) {
    const normalizedEmail = emailSchema.safeParse(data.email);
    if (normalizedEmail.success) {
      const { count } = await supabase
        .from("pending_ambassador_emails")
        .delete({ count: "exact" })
        .eq("email", normalizedEmail.data);
      pendingRemoved = (count ?? 0) > 0;
    }
  }

  return {
    removed: { userId: data.id, email: data.email, pending: pendingRemoved },
  };
}

export async function removeAmbassadorByEmail(
  supabase: SupabaseClient,
  rawEmail: string,
): Promise<RemoveAmbassadorResult> {
  const email = parseEmail(rawEmail);

  const { data: user, error: findError } = await supabase
    .from("users")
    .select("id, email")
    .ilike("email", email)
    .maybeSingle();

  if (findError) {
    throw new Error(`Failed to look up user: ${findError.message}`);
  }

  let removedUserId: string | undefined;
  if (user) {
    const { error: updateError } = await supabase
      .from("users")
      .update({ is_ambassador: false })
      .eq("id", user.id);

    if (updateError) {
      throw new Error(`Failed to revoke ambassador: ${updateError.message}`);
    }
    removedUserId = user.id;
  }

  const { count } = await supabase
    .from("pending_ambassador_emails")
    .delete({ count: "exact" })
    .eq("email", email);

  return {
    removed: {
      userId: removedUserId,
      email,
      pending: (count ?? 0) > 0,
    },
  };
}

export async function removePendingAmbassadorEmail(
  supabase: SupabaseClient,
  rawEmail: string,
): Promise<{ removed: boolean }> {
  const email = parseEmail(rawEmail);

  const { count, error } = await supabase
    .from("pending_ambassador_emails")
    .delete({ count: "exact" })
    .eq("email", email);

  if (error) {
    throw new Error(`Failed to remove pending email: ${error.message}`);
  }

  return { removed: (count ?? 0) > 0 };
}

export async function removeAmbassadorByIdentifier(
  supabase: SupabaseClient,
  rawIdentifier: string,
): Promise<RemoveAmbassadorResult> {
  const parsed = identifierSchema.safeParse(rawIdentifier);
  if (!parsed.success) {
    throw new Error(
      "Identifier must be a UUID (user id) or a valid email address",
    );
  }

  if (userIdSchema.safeParse(parsed.data).success) {
    return removeAmbassadorByUserId(supabase, parsed.data);
  }
  return removeAmbassadorByEmail(supabase, parsed.data);
}
