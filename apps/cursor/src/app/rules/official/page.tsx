import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title:
    "Official Rules from framework and library creators | Cursor Directory",
  description:
    "Official rules for Cursor from framework and library creators. Find the best rules for your project.",
};

export const dynamic = "force-static";
export const revalidate = 86400; // Revalidate once every day

export default async function Page() {
  redirect("/plugins");
}
