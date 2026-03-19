import { createClient } from "@/utils/supabase/admin-client";

export async function getUserProfile(slug: string, userId?: string) {
  const supabase = await createClient();

  const query = supabase
    .from("users")
    .select(
      "id, name, image, hero, status, bio, work, website, slug, social_x_link, created_at, public, follow_email, posts(*, votes(id)), is_following, follower_count, following_count",
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
      posts: data?.posts
        ?.sort(
          (a: { created_at: string }, b: { created_at: string }) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .map((post: { votes: { id: string }[] }) => ({
          ...post,
          user_avatar: data.image,
          user_name: data.name,
          vote_count: post.votes.length,
        })),
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

export async function getPopularPosts() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_popular_posts");

  if (error) {
    console.error(error);
  }

  return {
    data,
  };
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
    .select("id, name, slug, image, location, bio, website, social_x_link, hero, public, owner_id, created_at")
    .eq("owner_id", userId);

  return { data, error };
}

export async function getUserPlugins(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plugins")
    .select("*, plugin_components(*)")
    .eq("owner_id", userId)
    .eq("active", true)
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


export async function getFeaturedJobs({
  onlyPremium,
}: {
  onlyPremium?: boolean;
} = {}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .limit(100)
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

export async function getJobs() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .limit(1000) // TODO: Pagination
    .order("created_at", { ascending: false })
    .eq("active", true);

  return { data, error };
}

export async function getJobsByCompany(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*, companies!inner(*)")
    .eq("companies.slug", slug)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getJobById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*, company:companies(*)")
    .eq("id", id)
    .single();

  return { data, error };
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
  status: "pending" | "approved" | "declined";
  plan: string;
  order: number;
  install_count: number;
  star_count: number;
  created_at: string;
  updated_at: string;
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

export async function getPluginBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plugins")
    .select("*, plugin_components(*)")
    .eq("slug", slug)
    .single();

  return { data: data as PluginRow | null, error };
}

export async function getFeaturedPlugins({
  onlyPremium,
}: {
  onlyPremium?: boolean;
} = {}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plugins")
    .select("*, plugin_components(*)")
    .limit(100)
    .order("order", { ascending: false })
    .order("install_count", { ascending: false })
    .eq("active", true)
    .or(onlyPremium ? "plan.eq.premium" : "plan.eq.featured,plan.eq.premium");

  return {
    data: (data as PluginRow[] | null)?.sort(() => Math.random() - 0.5) ?? null,
    error,
  };
}

export async function getPendingPlugins({
  since,
}: { since?: string } = {}) {
  const supabase = await createClient();
  const PAGE_SIZE = 100;
  let allData: PluginRow[] = [];
  let from = 0;

  while (true) {
    let query = supabase
      .from("plugins")
      .select("*, plugin_components(*)")
      .eq("active", false)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (since) {
      query = query.gte("created_at", since);
    }

    const { data, error } = await query;
    if (error) return { data: allData.length ? allData : null, error };
    if (!data || data.length === 0) break;

    allData = allData.concat(data as PluginRow[]);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { data: allData as PluginRow[], error: null };
}

export async function getDeclinedPlugins({
  since,
}: { since?: string } = {}) {
  const supabase = await createClient();
  const PAGE_SIZE = 100;
  let allData: PluginRow[] = [];
  let from = 0;

  while (true) {
    let query = supabase
      .from("plugins")
      .select("*, plugin_components(*)")
      .eq("status", "declined")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (since) {
      query = query.gte("created_at", since);
    }

    const { data, error } = await query;
    if (error) return { data: allData.length ? allData : null, error };
    if (!data || data.length === 0) break;

    allData = allData.concat(data as PluginRow[]);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { data: allData as PluginRow[], error: null };
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

export type ForumPost = {
  id: number;
  title: string;
  slug: string;
  url: string;
  views: number;
  likeCount: number;
  postsCount: number;
  createdAt: string;
  excerpt: string | null;
  tags: string[];
  author: {
    username: string;
    name: string | null;
    avatarUrl: string | null;
  } | null;
};

export async function getForumPosts(): Promise<{ data: ForumPost[] }> {
  try {
    const res = await fetch("https://forum.cursor.com/top/weekly.json", {
      next: { revalidate: 86400 },
    });

    if (!res.ok) return { data: [] };

    const json = await res.json();
    const topics = json.topic_list?.topics ?? [];
    const users: Record<number, { username: string; name: string; avatar_template: string }> = {};

    for (const u of json.users ?? []) {
      users[u.id] = u;
    }

    const posts: ForumPost[] = topics
      .filter((t: any) => !t.pinned && !t.pinned_globally)
      .slice(0, 8)
      .map((t: any) => {
        const posterId = t.posters?.[0]?.user_id;
        const user = posterId != null ? users[posterId] : null;
        let avatarUrl: string | null = null;

        if (user?.avatar_template) {
          const tpl = user.avatar_template.replace("{size}", "48");
          avatarUrl = tpl.startsWith("http") ? tpl : `https://forum.cursor.com${tpl}`;
        }

        return {
          id: t.id,
          title: t.title,
          slug: t.slug,
          url: `https://forum.cursor.com/t/${t.slug}/${t.id}`,
          views: t.views ?? 0,
          likeCount: t.like_count ?? 0,
          postsCount: t.posts_count ?? 0,
          createdAt: t.created_at,
          excerpt: t.excerpt ?? null,
          tags: (t.tags ?? []).map((tag: any) => (typeof tag === "string" ? tag : tag.name)),
          author: user
            ? { username: user.username, name: user.name || null, avatarUrl }
            : null,
        };
      });

    return { data: posts };
  } catch {
    return { data: [] };
  }
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
