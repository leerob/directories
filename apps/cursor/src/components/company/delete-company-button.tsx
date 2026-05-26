"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCompanyAction } from "@/actions/delete-company";
import { Button } from "@/components/ui/button";

export function DeleteCompanyButton({
  id,
  slug,
}: {
  id: string;
  slug: string;
}) {
  const router = useRouter();

  const { execute, isExecuting } = useAction(deleteCompanyAction, {
    onSuccess: () => {
      toast.success("Company deleted.");
      router.push("/companies");
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to delete company.");
    },
  });

  const onDelete = () => {
    const confirmed = window.confirm(
      "Delete this company? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    execute({ id, slug });
  };

  return (
    <Button
      type="button"
      variant="destructive"
      className="h-8 rounded-full"
      onClick={onDelete}
      disabled={isExecuting}
    >
      {isExecuting ? "Deleting..." : "Delete Company"}
    </Button>
  );
}
