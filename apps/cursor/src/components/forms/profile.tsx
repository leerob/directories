"use client";

import { editProfileAction } from "@/actions/edit-profile";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      error: "Name must be at least 2 characters.",
    })
    .max(50, {
      error: "Name must be less than 50 characters.",
    }),
  status: z
    .string()
    .max(100, {
      error: "Status must be less than 100 characters.",
    })
    .optional(),
  bio: z
    .string()
    .max(500, {
      error: "Bio must be less than 500 characters.",
    })
    .optional(),
  work: z
    .string()
    .max(100, {
      error: "Work must be less than 100 characters.",
    })
    .optional()
    .nullable(),
  website: z
    .string()
    .url({ error: "Please enter a valid website URL." })
    .or(z.literal("")),
  social_x_link: z
    .string()
    .url({ error: "Please enter a valid X URL." })
    .or(z.literal("")),
  is_public: z.boolean().optional(),
  slug: z.string().min(1, {
    error: "Username is required.",
  }),
});

type ProfileData = {
  name?: string;
  status?: string;
  bio?: string;
  work?: string;
  website?: string;
  social_x_link?: string;
  is_public?: boolean;
  slug?: string;
};

export function ProfileForm({ data }: { data: ProfileData }) {
  const { execute, isExecuting } = useAction(editProfileAction);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name,
      status: data?.status ?? "",
      bio: data?.bio ?? "",
      work: data?.work ?? "",
      website: data?.website ?? "",
      social_x_link: data?.social_x_link ?? "",
      is_public: data?.is_public ?? true,
      slug: data?.slug,
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    execute({
      name: data.name,
      status: data.status || null,
      bio: data.bio || null,
      work: data.work || null,
      website: data.website || null,
      social_x_link: data.social_x_link || null,
      is_public: data.is_public ?? true,
      slug: data.slug,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ScrollArea className="h-[450px] pr-4">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your name"
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
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your username"
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your current status"
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
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself"
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
              name="work"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your current work"
                      {...field}
                      value={field.value || ""}
                      className="placeholder:text-[#878787] border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://your-website.com"
                      {...field}
                      type="url"
                      value={field.value || ""}
                      className="placeholder:text-[#878787] border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="social_x_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>X Profile</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://x.com/your-profile"
                      {...field}
                      type="url"
                      value={field.value || ""}
                      className="placeholder:text-[#878787] border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between border border-border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm">Public Profile</FormLabel>
                    <p className="text-xs text-[#878787]">
                      Make your profile visible to everyone
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>

        <Button type="submit" size="lg" className="w-full" disabled={isExecuting}>
          {isExecuting ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </Form>
  );
}
