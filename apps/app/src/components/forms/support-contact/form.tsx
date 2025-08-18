"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@synoro/ui/components/button";
import { Checkbox } from "@synoro/ui/components/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synoro/ui/components/form";
import { Input } from "@synoro/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@synoro/ui/components/select";
import { Textarea } from "@synoro/ui/components/textarea";

export const types = [
  {
    label: "Report a bug",
    value: "bug" as const,
  },
  {
    label: "Book a demo",
    value: "demo" as const,
  },
  {
    label: "Suggest a feature",
    value: "feature" as const,
  },
  {
    label: "Report a security issue",
    value: "security" as const,
  },
  {
    label: "Something else",
    value: "question" as const,
  },
];

export const schema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  type: z.enum(["bug", "demo", "feature", "security", "question"]),
  email: z.string().email({ message: "Invalid email address" }),
  message: z.string().min(1, { message: "Message is required" }),
  blocker: z.boolean(),
});

export type FormValues = z.infer<typeof schema>;

interface ContactFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit?: (data: FormValues) => Promise<void> | void;
  className?: string;
}

export function ContactForm({
  defaultValues,
  onSubmit,
  className,
}: ContactFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      type: defaultValues?.type ?? undefined,
      message: defaultValues?.message ?? "",
      blocker: defaultValues?.blocker ?? false,
    },
  });
  const [isPending, startTransition] = useTransition();
  const watchType = form.watch("type");

  async function submitAction(values: FormValues) {
    if (isPending) return;

    startTransition(async () => {
      try {
        const promise = new Promise((resolve) => setTimeout(resolve, 1000));
        toast.promise(promise, {
          loading: "Saving...",
          success: () => JSON.stringify(values),
          error: "Failed to save",
        });
        await promise;
        onSubmit?.(values);
      } catch (error) {
        console.error(error);
      }
    });
  }

  console.log(form.formState.errors);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitAction)}
        className={cn("grid gap-4 sm:grid-cols-2", className)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Max" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="max@synoro.dev" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="sm:col-span-full">
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="What you need help with" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {watchType ? (
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="sm:col-span-full">
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea placeholder="Tell us about it..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}
        {watchType === "bug" ? (
          <FormField
            control={form.control}
            name="blocker"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start sm:col-span-full">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="leading-none font-normal">
                  This bug prevents me from using the product.
                </FormLabel>
              </FormItem>
            )}
          />
        ) : null}
        <Button
          type="submit"
          className="w-full sm:col-span-full"
          disabled={isPending}
        >
          {isPending ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
