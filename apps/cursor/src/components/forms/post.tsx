"use client";

import { createPostAction } from "@/actions/create-post-action";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  title: z
    .string()
    .min(4, {
      message: "Title must be at least 4 characters.",
    })
    .max(250, {
      message: "Title must be less than 250 characters.",
    }),
  content: z
    .string()
    .max(500, {
      message: "Content must be less than 500 characters.",
    })
    .optional(),
  url: z.url(),
});

export function PostForm({ onSuccess }: { onSuccess: () => void }) {
  const createPost = useAction(createPostAction, {
    onSuccess: () => {
      form.reset();
      onSuccess();
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      url: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createPost.execute({
      title: data.title,
      content: data.content && data.content.length > 0 ? data.content : null,
      url: data.url,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Type your title here"
                  {...field}
                  className="placeholder:text-[#878787] border-border"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com"
                  {...field}
                  type="url"
                  className="placeholder:text-[#878787] border-border"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your post here"
                  {...field}
                  className="placeholder:text-[#878787] border-border"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={createPost.isExecuting}
        >
          {createPost.isExecuting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
