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

  return {
    data: {
      ...data,
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
  const query = supabase.from("companies").select("*").eq("slug", slug);

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
    .select("*")
    .eq("owner_id", userId);

  return { data, error };
}

export async function getCompanies() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  return {
    data,
    error,
  };
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
    .select("*")
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
