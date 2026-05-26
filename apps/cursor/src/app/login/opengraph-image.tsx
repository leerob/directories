import { createListingOG, OG } from "@/lib/og";

export const alt = "Sign In";
export const size = { width: OG.width, height: OG.height };
export const contentType = "image/png";
export const revalidate = 86400;

export default async function Image() {
  return createListingOG("Sign In", "Sign in to Cursor Directory");
}
