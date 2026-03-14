import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const REPO = "cursor/mcp-servers";
const DRY_RUN = process.argv.includes("--dry-run");
const RESULTS_FILE = "scripts/sync-results.json";

interface Result {
  issue: number;
  slug: string;
  name: string;
  status: string;
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

  const results: Result[] = JSON.parse(readFileSync(RESULTS_FILE, "utf-8"));
  const created = results.filter((r) => r.status === "created");

  console.log(`Found ${created.length} created MCPs to verify and comment on\n`);

  let commented = 0;
  let verified = 0;
  let notReady = 0;

  for (const r of created) {
    const exists = await checkPageExists(r.slug);

    if (exists) {
      verified++;
      const url = `https://cursor.directory/plugins/mcp-${r.slug}`;
      console.log(`  #${r.issue} "${r.name}": verified at ${url}`);

      if (!DRY_RUN) {
        const commentBody = [
          `This MCP server has been published on **Cursor Directory**!`,
          ``,
          `**View it here:** [${r.name} on Cursor Directory](${url})`,
          ``,
          `You can now discover and install it directly from [cursor.directory/plugins](https://cursor.directory/plugins).`,
        ].join("\n");

        try {
          execFileSync("gh", [
            "issue",
            "comment",
            String(r.issue),
            "--repo",
            REPO,
            "--body",
            commentBody,
          ]);
          console.log(`    -> Comment posted!`);
          commented++;
        } catch (err) {
          console.error(`    -> Failed to comment: ${err}`);
        }
      }
    } else {
      notReady++;
      console.log(`  #${r.issue} "${r.name}": NOT ready yet (mcp-${r.slug})`);
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Verified: ${verified}`);
  console.log(`Not ready: ${notReady}`);
  console.log(`Comments posted: ${commented}`);
}

main().catch(console.error);
