"use client";

import { updateJobListingAction } from "@/actions/update-job-listing";
import { CompanySelect } from "@/components/company/company-select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";

const formSchema = z.object({
  company_id: z.string({
    error: "Please select a company.",
  }),
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  location: z.string().min(1, {
    message: "Location is required.",
  }),
  description: z
    .string()
    .min(10, {
      message: "Description must be at least 10 characters.",
    })
    .max(500, {
      message: "Description must be less than 500 characters.",
    }),
  link: z.url({
    error: "Please enter a valid job posting URL.",
  }),
  workplace: z.enum(["On site", "Remote", "Hybrid"]),
  experience: z.string().optional(),
});

export type JobData = {
  id: number;
  title?: string;
  location?: string;
  description?: string;
  link?: string;
  workplace?: "On site" | "Remote" | "Hybrid";
  experience?: string;
  company_id: string;
  active: boolean;
};

export function EditJobForm({ data }: { data: JobData }) {
  const { execute, isExecuting } = useAction(updateJobListingAction, {
    onSuccess: () => {
      toast.success("Job listing updated successfully");
    },
    onError: () => {
      toast.error("Failed to update job listing");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_id: data?.company_id ?? "",
      title: data?.title ?? "",
      location: data?.location ?? "",
      description: data?.description ?? "",
      link: data?.link ?? "",
      workplace: data?.workplace ?? "On site",
      experience: data?.experience ?? "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    execute({
      id: data.id,
      company_id: values.company_id,
      title: values.title,
      location: values.location,
      description: values.description,
      link: values.link,
      workplace: values.workplace,
      experience: values.experience ?? null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6 pb-6">
          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <CompanySelect
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job listing title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Senior Software Engineer"
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="New York"
                    {...field}
                    className="placeholder:text-[#878787] border-border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="workplace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workplace Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-border">
                        <SelectValue placeholder="Select workplace type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="On site">On site</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of experience</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="4"
                      {...field}
                      className="placeholder:text-[#878787] border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job listing description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write a description of the role..."
                    {...field}
                    className="placeholder:text-[#878787] border-border min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to job page</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://your-company.com/careers/job-posting"
                    {...field}
                    type="url"
                    className="placeholder:text-[#878787] border-border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isExecuting || !form.formState.isDirty}
        >
          {isExecuting ? "Updating..." : "Update"}
        </Button>
      </form>
    </Form>
  );
}
