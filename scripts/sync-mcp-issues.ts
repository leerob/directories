import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const envContent = readFileSync("apps/cursor/.env", "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const OWNER_ID = process.env.MCP_OWNER_ID!;
const REPO = "cursor/mcp-servers";
const DRY_RUN = process.argv.includes("--dry-run");
const DO_COMMENT = process.argv.includes("--comment");
const SINGLE_ISSUE = process.argv
  .find((a) => a.startsWith("--issue="))
  ?.replace("--issue=", "");
const RESULTS_FILE = "scripts/sync-results.json";

interface ParsedIssue {
  number: number;
  title: string;
  name: string;
  description: string;
  config: Record<string, any> | null;
  repoUrl: string;
  docsUrl: string;
  iconUrl: string;
  hasOAuth: boolean;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseIssueBody(body: string): Omit<ParsedIssue, "number" | "title"> {
  const sections = new Map<string, string>();
  const lines = body.split("\n");
  let currentSection = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith("### ")) {
      if (currentSection) {
        sections.set(currentSection, currentContent.join("\n").trim());
      }
      currentSection = line.replace("### ", "").trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentSection) {
    sections.set(currentSection, currentContent.join("\n").trim());
  }

  const name = sections.get("Server Name") || "";
  const description = sections.get("Description") || "";
  const repoUrl = sections.get("Server URL/Repository") || "";
  const docsUrl =
    sections.get("Documentation URL (if applicable)") ||
    sections.get("Documentation URL") ||
    "";

  let config: Record<string, any> | null = null;
  const configRaw = sections.get("Configuration JSON") || "";
  const jsonMatch = configRaw.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.mcpServers) {
        const key = Object.keys(parsed.mcpServers)[0];
        config = parsed.mcpServers[key];
      } else {
        config = parsed;
      }
    } catch {}
  }
  if (!config) {
    const bareJson = configRaw.replace(/```(?:json)?/g, "").trim();
    try {
      const parsed = JSON.parse(bareJson);
      if (parsed.mcpServers) {
        const key = Object.keys(parsed.mcpServers)[0];
        config = parsed.mcpServers[key];
      } else {
        config = parsed;
      }
    } catch {}
  }

  const authSection = sections.get("Authentication") || "";
  const hasOAuth =
    authSection.includes("[x]") &&
    authSection.toLowerCase().includes("oauth");

  let iconUrl = "";
  const iconSection = sections.get("Icon") || "";
  const urlMatch = iconSection.match(
    /https?:\/\/[^\s)]+\.svg(?:\?[^\s)]*)?/i,
  );
  if (urlMatch) {
    iconUrl = urlMatch[0];
  }
  if (!iconUrl) {
    const contextSection = sections.get("Additional Context") || "";
    const imgMatch = contextSection.match(
      /https?:\/\/github\.com\/user-attachments\/assets\/[^\s)"]+/,
    );
    if (imgMatch) {
      iconUrl = imgMatch[0];
    }
  }

  return { name, description, config, repoUrl, docsUrl, iconUrl, hasOAuth };
}

function buildMcpLink(
  name: string,
  config: Record<string, any>,
): string {
  const configStr = JSON.stringify(config);
  const b64 = Buffer.from(configStr).toString("base64");
  return `https://cursor.com/en/install-mcp?name=${encodeURIComponent(name)}&config=${b64}`;
}

async function uploadIcon(
  slug: string,
  iconUrl: string,
): Promise<string | null> {
  if (!iconUrl) return null;

  try {
    const response = await fetch(iconUrl);
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    const buffer = Buffer.from(await response.arrayBuffer());

    const ext = contentType.includes("svg") ? "svg" : "png";
    const filePath = `${slug}.${ext}`;

    const { error } = await supabase.storage
      .from("mcp-logos")
      .upload(filePath, buffer, {
        contentType: ext === "svg" ? "image/svg+xml" : "image/png",
        upsert: true,
      });

    if (error) {
      console.error(`  Icon upload error: ${error.message}`);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("mcp-logos").getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error(`  Icon fetch error: ${err}`);
    return null;
  }
}

function ghComment(issueNumber: number, body: string) {
  execFileSync("gh", [
    "issue",
    "comment",
    String(issueNumber),
    "--repo",
    REPO,
    "--body",
    body,
  ]);
}

async function checkPageExists(slug: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://cursor.directory/plugins/mcp-${slug}`,
      { method: "HEAD", redirect: "follow" },
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

  const ghArgs = [
    "issue",
    "list",
    "--repo",
    REPO,
    "--state",
    "open",
    "--limit",
    "200",
    "--json",
    "number,title,body",
  ];

  const issuesJson = execFileSync("gh", ghArgs, { encoding: "utf-8" });
  const allIssues: { number: number; title: string; body: string }[] =
    JSON.parse(issuesJson);

  let issues = allIssues.filter((i) =>
    i.title.startsWith("[Server Request]"),
  );

  if (SINGLE_ISSUE) {
    issues = issues.filter((i) => i.number === Number(SINGLE_ISSUE));
  }

  console.log(`Found ${issues.length} server request issues\n`);

  const PAGE_SIZE = 100;
  let existingMcps: any[] = [];
  let from = 0;
  while (true) {
    const { data } = await supabase
      .from("mcps")
      .select("id, name, slug, active")
      .range(from, from + PAGE_SIZE - 1);
    if (!data || data.length === 0) break;
    existingMcps = existingMcps.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  const existingSlugs = new Set(existingMcps.map((m) => m.slug));
  const existingNames = new Set(
    existingMcps.map((m) => m.name?.toLowerCase().trim()),
  );

  let created = 0;
  let skipped = 0;
  let commented = 0;
  const results: { issue: number; slug: string; name: string; status: string }[] = [];

  for (const issue of issues) {
    const parsed = parseIssueBody(issue.body);
    const name = parsed.name || issue.title.replace("[Server Request]: ", "");

    if (!name) {
      console.log(`#${issue.number}: No name found, skipping`);
      results.push({ issue: issue.number, slug: "", name: "", status: "skipped-no-name" });
      skipped++;
      continue;
    }

    const slug = slugify(name);

    if (existingSlugs.has(slug) || existingNames.has(name.toLowerCase().trim())) {
      console.log(`#${issue.number}: "${name}" (${slug}) already exists, skipping`);
      results.push({ issue: issue.number, slug, name, status: "already-exists" });
      skipped++;
      continue;
    }

    if (!parsed.config) {
      console.log(`#${issue.number}: "${name}" has no parseable config JSON, skipping`);
      results.push({ issue: issue.number, slug, name, status: "skipped-no-config" });
      skipped++;
      continue;
    }

    console.log(`\n#${issue.number}: "${name}" (${slug})`);
    console.log(`  Description: ${parsed.description.substring(0, 100)}...`);
    console.log(`  Config: ${JSON.stringify(parsed.config).substring(0, 100)}`);
    console.log(`  Repo: ${parsed.repoUrl}`);
    console.log(`  Icon: ${parsed.iconUrl || "none"}`);

    const mcpLink = buildMcpLink(name, parsed.config);
    const link = parsed.docsUrl || parsed.repoUrl || "";

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would create MCP and comment on issue`);
      results.push({ issue: issue.number, slug, name, status: "would-create" });
      created++;
      continue;
    }

    let logoUrl: string | null = null;
    if (parsed.iconUrl) {
      logoUrl = await uploadIcon(slug, parsed.iconUrl);
      if (logoUrl) console.log(`  Uploaded icon: ${logoUrl}`);
    }

    const { error } = await supabase.from("mcps").insert({
      name,
      slug,
      description: parsed.description,
      link,
      mcp_link: mcpLink,
      logo: logoUrl,
      owner_id: OWNER_ID,
      plan: "standard",
      active: true,
    });

    if (error) {
      console.error(`  DB insert error: ${error.message}`);
      results.push({ issue: issue.number, slug, name, status: "error: " + error.message });
      continue;
    }

    console.log(`  Created in DB!`);
    created++;
    results.push({ issue: issue.number, slug, name, status: "created" });
  }

  console.log(`\n\n=== Summary ===`);
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`\nResults:`);
  for (const r of results) {
    console.log(`  #${r.issue} ${r.name || "(no name)"} -> ${r.status}${r.slug ? ` (mcp-${r.slug})` : ""}`);
  }

  if (!DRY_RUN) {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to ${RESULTS_FILE}`);
    console.log(`To comment on issues later, run: bun run scripts/comment-mcp-issues.ts`);
  }

  if (!DRY_RUN && DO_COMMENT && created > 0) {
    console.log(`\nWaiting 5s for pages to propagate before verification...`);
    await new Promise((r) => setTimeout(r, 5000));

    console.log(`\nVerifying pages and commenting on issues...`);
    for (const r of results) {
      if (r.status !== "created") continue;

      const exists = await checkPageExists(r.slug);
      if (exists) {
        const url = `https://cursor.directory/plugins/mcp-${r.slug}`;
        console.log(`  #${r.issue}: Page verified at ${url}`);

        const commentBody = [
          `This MCP server has been published on **Cursor Directory**! 🎉`,
          ``,
          `**View it here:** [${r.name} on Cursor Directory](${url})`,
          ``,
          `You can now discover and install it directly from [cursor.directory/plugins](https://cursor.directory/plugins).`,
        ].join("\n");

        try {
          ghComment(r.issue, commentBody);
          console.log(`  #${r.issue}: Comment posted!`);
          commented++;
        } catch (err) {
          console.error(`  #${r.issue}: Failed to comment: ${err}`);
        }
      } else {
        console.log(`  #${r.issue}: Page NOT yet available at mcp-${r.slug} (may need ISR revalidation)`);
      }
    }

    console.log(`\nComments posted: ${commented}`);
  }
}

main().catch(console.error);
