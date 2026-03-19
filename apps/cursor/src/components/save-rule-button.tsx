"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Download } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const SaveRuleSchema = z.object({
  fileName: z.string().min(1, { error: "File name is required." }),
});

type SaveRuleFormData = z.infer<typeof SaveRuleSchema>;

export function SaveRuleButton({
  slug,
  content,
  small,
}: {
  slug: string;
  content: string;
  small?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const form = useForm<SaveRuleFormData>({
    resolver: zodResolver(SaveRuleSchema),
    defaultValues: {
      fileName: slug,
    },
  });

  useEffect(() => {
    setIsSupported(isFileSystemAccessSupported());
  }, []);

  async function onSubmit({ fileName }: SaveRuleFormData) {
    try {
      const directoryHandle = await window.showDirectoryPicker();

      const cursorDirectoryHandle = await directoryHandle.getDirectoryHandle(
        ".cursor",
        { create: true },
      );

      const ruleDirectoryHandle =
        await cursorDirectoryHandle.getDirectoryHandle("rules", {
          create: true,
        });

      const fileHandle = await ruleDirectoryHandle.getFileHandle(
        `${fileName}.mdc`,
        { create: true },
      );

      const writableStream = await fileHandle.createWritable();

      await writableStream.write(content);

      await writableStream.close();

      toast.success("File was saved successfully!");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.error("Folder selection was canceled.");
      } else {
        console.error(error);
        toast.error("Failed to save file.");
      }
    } finally {
      setOpen(false);
    }
  }

  if (!isSupported) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "text-xs bg-black text-white dark:bg-white dark:text-black rounded-full flex items-center justify-center",
            small ? "p-1.5 size-7" : "p-2 size-9",
          )}
          type="button"
        >
          <Download className={small ? "size-3" : "size-4"} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Rule</DialogTitle>
          <DialogDescription>
            Save a rule on .cursor/rules directory.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Name</FormLabel>
                  <FormControl>
                    <Input placeholder="file name" {...field} />
                  </FormControl>
                  <FormDescription>
                    The file will be saved with a .mdc extension.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="w-full">
              Save
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// @see https://web.dev/patterns/files/open-a-directory
function isFileSystemAccessSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "showDirectoryPicker" in window &&
    (() => {
      try {
        return window.self === window.top;
      } catch {
        return false;
      }
    })()
  );
}
