import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { EditPluginForm } from "@/components/forms/edit-plugin-form";
import { PluginOwnerMenu } from "@/components/plugins/plugin-owner-menu";
import { Login } from "@/components/login";
import { getPluginBySlug } from "@/data/queries";
import { getSession } from "@/utils/supabase/auth";

type Params = Promise<{ slug: string }>;

export const metadata: Metadata = {
  title: "Edit Plugin | Cursor Directory",
  description: "Edit your plugin on Cursor Directory.",
};

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const session = await getSession();
  const { data: plugin } = await getPluginBySlug(slug);

  if (!plugin) {
    redirect("/");
  }

  if (!session) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <Suspense fallback={null}>
            <Login redirectTo={`/plugins/${slug}/edit`} />
          </Suspense>
        </div>
      </div>
    );
  }

  if (plugin.owner_id !== session.user.id) {
    redirect("/");
  }

  return (
    <div className="min-h-screen px-6 pt-24 md:pt-32 pb-32">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-10 flex items-start justify-between gap-4">
          <h1 className="marketing-page-title mb-3">Edit Plugin</h1>
          <PluginOwnerMenu plugin={plugin} />
        </div>

        <EditPluginForm data={plugin} />
      </div>
    </div>
  );
}
