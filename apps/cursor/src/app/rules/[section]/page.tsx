import { redirect } from "next/navigation";

export default async function Page({
  params,
}: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  redirect(`/plugins?tag=${section}`);
}
