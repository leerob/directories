"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { ActionError, authActionClient } from "./safe-action";

export const deleteCompanyAction = authActionClient
  .metadata({
    actionName: "delete-company",
  })
  .schema(
    z.object({
      id: z.string(),
      slug: z.string(),
    }),
  )
  .action(async ({ parsedInput: { id, slug }, ctx: { userId } }) => {
    const supabase = await createClient();

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, owner_id")
      .eq("id", id)
      .single();

    if (companyError || !company) {
      throw new ActionError("Company not found.");
    }

    if (company.owner_id !== userId) {
      throw new ActionError("You do not have permission to delete this company.");
    }

    const { error: unlinkMcpsError } = await supabase
      .from("mcps")
      .update({ company_id: null })
      .eq("company_id", id)
      .eq("owner_id", userId);

    if (unlinkMcpsError) {
      throw new ActionError(`Failed to unlink MCPs: ${unlinkMcpsError.message}`);
    }

    const { error: deleteError } = await supabase
      .from("companies")
      .delete()
      .eq("id", id)
      .eq("owner_id", userId);

    if (deleteError) {
      throw new ActionError(`Failed to delete company: ${deleteError.message}`);
    }

    revalidatePath("/companies");
    revalidatePath(`/c/${slug}`);
    revalidatePath("/");

    return { success: true };
  });
