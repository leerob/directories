import { createClient } from "@/utils/supabase/admin-client";

export async function getUserProfile(slug: string, userId?: string) {
  const supabase = await createClient();

  const query = supabase
    .from("users")
    .select(
      "id, name, image, hero, status, bio, work, website, slug, social_x_link, created_at, public, follow_email, is_ambassador, is_following, follower_count, following_count",
    )
    .eq("slug", slug);

  if (userId) {
    query.eq("id", userId);
  } else {
    query.eq("public", true);
  }

  const { data } = await query.single();

  if (!data) {
    return {
      data: null,
    };
  }

  const isOwner = userId && data.id === userId;

  return {
    data: {
      ...data,
      follow_email: isOwner ? data.follow_email : undefined,
      following_count: data?.following_count || 0,
      followers_count: data?.follower_count || 0,
    },
  };
}

export async function getUserFollowers(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("followers")
    .select("follower:follower_id(id, name, image, slug)")
    .eq("following_id", id);

  return { data, error };
}

export async function getUserFollowing(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("followers")
    .select("following:following_id(id, name, image, slug)")
    .eq("follower_id", id);

  return { data, error };
}

export async function getCompanyProfile(slug: string, userId?: string) {
  const supabase = await createClient();
  const query = supabase
    .from("companies")
    .select(
      "id, name, slug, image, location, bio, website, social_x_link, hero, public, owner_id, created_at",
    )
    .eq("slug", slug);

  if (userId) {
    query.eq("owner_id", userId);
  }

  const { data, error } = await query.single();

  return { data, error };
}

export async function getUserCompanies(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select(
      "id, name, slug, image, location, bio, website, social_x_link, hero, public, owner_id, created_at",
    )
    .eq("owner_id", userId);

  return { data, error };
}

export async function getUserPlugins(
  userId: string,
  { includeInactive = false }: { includeInactive?: boolean } = {},
) {
  const supabase = await createClient();
  let query = supabase
    .from("plugins")
    .select("*, plugin_components(*)")
    .eq("owner_id", userId);

  if (!includeInactive) {
    query = query.eq("active", true);
  }

  const { data, error } = await query
    .order("install_count", { ascending: false })
    .order("created_at", { ascending: false });

  return { data: data as PluginRow[] | null, error };
}

export async function getCompanies() {
  const supabase = await createClient();
  const all: any[] = [];
  const PAGE_SIZE = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, slug, image, location")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) return { data: all, error };
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { data: all, error: null };
}

export async function getFeaturedMCPs({
  onlyPremium,
}: {
  onlyPremium?: boolean;
} = {}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mcps")
    .select("*")
    .limit(100)
    .order("created_at", { ascending: false })
    .order("order", { ascending: false })
    .order("created_at", { ascending: false })
    .eq("active", true)
    .or(onlyPremium ? "plan.eq.premium" : "plan.eq.featured,plan.eq.premium");

  return {
    // Shuffle the data
    data: data?.sort(() => Math.random() - 0.5),
    error,
  };
}

export async function getTotalUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("count", { count: "exact" })
    .single();

  return { data, error };
}

export async function getNewUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("slug, name, image")
    .eq("public", true)
    .order("created_at", { ascending: false })
    .limit(24);

  return { data, error };
}

export async function getMCPs({
  page = 1,
  limit = 36,
  fetchAll = false,
}: {
  page?: number;
  limit?: number;
  fetchAll?: boolean;
} = {}) {
  const supabase = await createClient();

  if (fetchAll) {
    const PAGE_SIZE = 100;
    let allData: any[] = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("mcps")
        .select("*")
        .eq("active", true)
        .order("company_id", { ascending: true, nullsFirst: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) return { data: null, error };
      if (!data || data.length === 0) break;

      allData = allData.concat(data);
      hasMore = data.length === PAGE_SIZE;
      from += PAGE_SIZE;
    }

    return { data: allData, error: null };
  }

  const { data, error } = await supabase
    .from("mcps")
    .select("*")
    .eq("active", true)
    .order("company_id", { ascending: true, nullsFirst: false })
    .limit(limit)
    .range((page - 1) * limit, page * limit - 1);

  return { data, error };
}

export async function getRecentMCPs({ limit = 8 }: { limit?: number } = {}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mcps")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data, error };
}

export async function getMCPBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mcps")
    .select("*")
    .eq("slug", slug)
    .single();

  return { data, error };
}

// ---------------------------------------------------------------------------
// Plugins (Open Plugins spec)
// ---------------------------------------------------------------------------

export type PluginComponent = {
  id: string;
  plugin_id: string;
  type: string;
  name: string;
  slug: string;
  description: string | null;
  content: string | null;
  metadata: Record<string, unknown>;
  sort_order: number;
  created_at: string;
};

export type ScanStatus =
  | "pending"
  | "scanning"
  | "safe"
  | "flagged"
  | "error"
  | "unscanned";
export type FlagSeverity = "low" | "medium" | "high";
export type FlagCategory =
  | "malicious_code"
  | "prompt_injection"
  | "spam"
  | "nsfw"
  | "impersonation"
  | "low_quality";

export type ScanVerdict = {
  verdict: "safe" | "suspicious" | "malicious";
  severity: FlagSeverity;
  categories: FlagCategory[];
  reasons: string[];
  summary: string;
};

export type PluginRow = {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string | null;
  homepage: string | null;
  repository: string | null;
  license: string | null;
  logo: string | null;
  keywords: string[];
  author_name: string | null;
  author_url: string | null;
  author_avatar: string | null;
  owner_id: string | null;
  active: boolean;
  plan: string;
  order: number;
  install_count: number;
  star_count: number;
  created_at: string;
  updated_at: string;
  scan_status: ScanStatus;
  scan_verdict: ScanVerdict | null;
  flag_reasons: string[];
  flag_severity: FlagSeverity | null;
  flag_summary: string | null;
  flagged_at: string | null;
  last_scanned_at: string | null;
  scan_run_id: string | null;
  permanently_blocked: boolean;
  discovery_source: string | null;
  github_repo_id: number | null;
  verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  verification_requested_at: string | null;
  plugin_components?: PluginComponent[];
};

export async function getPlugins({
  page = 1,
  limit = 36,
  fetchAll = false,
}: {
  page?: number;
  limit?: number;
  fetchAll?: boolean;
} = {}): Promise<{ data: PluginRow[] | null; error: any }> {
  const supabase = await createClient();

  if (fetchAll) {
    const PAGE_SIZE = 100;
    let allData: PluginRow[] = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("plugins")
        .select("*, plugin_components(*)")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) return { data: null, error };
      if (!data || data.length === 0) break;

      allData = allData.concat(data as PluginRow[]);
      hasMore = data.length === PAGE_SIZE;
      from += PAGE_SIZE;
    }

    return { data: allData, error: null };
  }

  const { data, error } = await supabase
    .from("plugins")
    .select("*, plugin_components(*)")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(limit)
    .range((page - 1) * limit, page * limit - 1);

  return { data: data as PluginRow[] | null, error };
}

// Returns a Map<plugin_id, installs in last `windowDays` days>, derived
// from `plugin_install_snapshots` via the `plugin_install_velocity` SQL
// function. Plugins with no snapshot history yet (or no fresh installs)
// will simply be absent from the map; callers should default to 0.
export async function getPluginInstallVelocity(windowDays = 30): Promise<{
  data: Map<string, number> | null;
  error: unknown;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("plugin_install_velocity", {
    window_days: windowDays,
  });

  if (error) return { data: null, error };

  const map = new Map<string, number>();
  for (const row of (data ?? []) as {
    plugin_id: string;
    installs_window: number;
  }[]) {
    map.set(row.plugin_id, row.installs_window);
  }
  return { data: map, error: null };
}

export async function getPluginBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plugins")
    .select("*, plugin_components(*)")
    .eq("slug", slug)
    .single();

  return { data: data as PluginRow | null, error };
}

export async function getPendingPlugins() {
  const supabase = await createClient();
  const PAGE_SIZE = 100;
  let allData: PluginRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("plugins")
      .select("*, plugin_components(*)")
      .eq("active", false)
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) return { data: allData.length ? allData : null, error };
    if (!data || data.length === 0) break;

    allData = allData.concat(data as PluginRow[]);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { data: allData as PluginRow[], error: null };
}

export async function getFlaggedPlugins() {
  const supabase = await createClient();
  const severityRank = { high: 0, medium: 1, low: 2 } as const;

  const { data, error } = await supabase
    .from("plugins")
    .select("*, plugin_components(*)")
    .eq("scan_status", "flagged")
    .order("flagged_at", { ascending: false, nullsFirst: false })
    .limit(500);

  if (error) return { data: null as PluginRow[] | null, error };

  const sorted = (data as PluginRow[] | null)?.slice().sort((a, b) => {
    const aRank = a.flag_severity ? severityRank[a.flag_severity] : 3;
    const bRank = b.flag_severity ? severityRank[b.flag_severity] : 3;
    if (aRank !== bRank) return aRank - bRank;
    const aTime = a.flagged_at ? new Date(a.flagged_at).getTime() : 0;
    const bTime = b.flagged_at ? new Date(b.flagged_at).getTime() : 0;
    return bTime - aTime;
  });

  return { data: sorted ?? null, error: null };
}

export async function getPendingVerificationRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plugins")
    .select("*, plugin_components(*)")
    .not("verification_requested_at", "is", null)
    .eq("verified", false)
    .order("verification_requested_at", { ascending: false, nullsFirst: false })
    .limit(500);

  return { data: data as PluginRow[] | null, error };
}

export async function getStuckScans() {
  const supabase = await createClient();
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("plugins")
    .select("*, plugin_components(*)")
    .or(
      `scan_status.eq.error,and(scan_status.in.(pending,scanning),created_at.lt.${fifteenMinutesAgo})`,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return { data: data as PluginRow[] | null, error };
}

export async function getStarredPlugins(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plugin_stars")
    .select("plugin:plugin_id(*, plugin_components(*))")
    .eq("user_id", userId);

  const plugins = (data ?? [])
    .map((row: any) => row.plugin)
    .filter(Boolean) as PluginRow[];

  return { data: plugins, error };
}

export async function hasUserStarredPlugin(pluginId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("plugin_stars")
    .select("plugin_id")
    .eq("plugin_id", pluginId)
    .eq("user_id", userId)
    .maybeSingle();

  return !!data;
}

type GetMembersParams = {
  page?: number;
  limit?: number;
  q?: string;
};

export async function getMembers({
  page = 1,
  limit = 33,
  q,
}: GetMembersParams = {}) {
  const supabase = await createClient();
  const query = supabase
    .from("users")
    .select("id, name, image, slug, follower_count")
    .eq("public", true)
    .order("created_at", { ascending: false })
    .limit(limit)
    .range((page - 1) * limit, page * limit - 1)
    .neq("name", "unknown user");

  if (q) {
    query.textSearch("name", q, {
      type: "websearch",
      config: "english",
    });
  }

  const { data, error } = await query;

  return { data, error };
}
