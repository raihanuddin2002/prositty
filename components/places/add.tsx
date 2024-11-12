"use client";
import React, { Fragment, useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Textarea } from "../ui/textarea";
import { Input } from "@/components/ui/input";
import {
  HiOutlineCheck,
  HiOutlinePlus,
  HiOutlineSelector,
} from "react-icons/hi";
import { Button } from "../ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { CategoryData } from "../category/list";
import { useToast } from "../ui/use-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { addPlace } from "@/app/supabase-client";

export const addPlaceSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "The name is too short (minimum 2 characters)!" })
      .max(60, { message: "The name is too long (maximum 60 characters)!" }),
    category: z.string().optional(),
    isOnline: z.boolean().default(false),
    city: z
      .string()
      .max(70, {
        message: "The city name is too long (maximum 70 characters)!",
      })
      .optional(),
    comment: z.string().max(500, {
      message: "Your comment is too long (maximum 500 characters)!",
    }),
    link: z
      .string()
      .regex(
        /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/,
        { message: "The link you entered is not a valid url!" }
      )
      .optional(),
    tags: z
      .array(z.string())
      .optional(),
    contact: z
      .string()
      .max(90, {
        message: "The contact information is too long (maximum 90 characters)!",
      })
      .optional(),
  })
  .refine((data) => !(!data.isOnline && !data.city), {
    message:
      "The city input is required when the Reccomendation has a physical location!",
    path: ["city"],
  });

export default function AddPlaceForm({
  categories,
}: {
  categories: CategoryData[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [hashtags, setHashTags] = useState([] as string[]);
  const [tagsInputValue, setTagsInputValue] = useState('')

  const form = useForm<z.infer<typeof addPlaceSchema>>({
    resolver: zodResolver(addPlaceSchema),
    defaultValues: {
      name: "",
      comment: "",
      city: "",
      category: "732ba6fa-6f52-4c07-bef7-d93bfae67afa",
      tags: [] as string[]
    },
  });

  const isOnline = form.watch("isOnline");

  async function onSubmit(values: z.infer<typeof addPlaceSchema>) {
    setLoading(true);
    const result = await addPlace({ ...values, tags: hashtags });

    if (result.data) {
      toast({
        title: "Success!",
        variant: "success",
        description: `The Recommendation named ${result.data[0].name} was created successfully!`,
      });
      form.reset();
      setHashTags([])
      setLoading(false);
      return router.push("/account/recommendations");
    } else {
      toast({
        title: "Error!",
        variant: "destructive",
        description: `An unknown server error came up when creating your Recommendation!`,
      });
      form.reset();
      setLoading(false);
      return router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-2 max-w-lg mx-auto mb-6"
      >
        <div className="my-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recommendation name</FormLabel>
                <FormControl>
                  <Input placeholder="Shopping malls" {...field} />
                </FormControl>
                {/*                 <FormDescription>
                  This is the name of the Recommendation. It can be a bussiness,
                  point of interest, an online tool or anything that you want to
                  reccomend!
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-4">
                <FormLabel className="mb-1">Category</FormLabel>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? categories?.find(
                            (category) => category.id === field.value
                          )?.name
                          : "Uncategorized"}
                        <HiOutlineSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 md:w-[32rem] p-0">
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {categories?.map((category) => (
                          <CommandItem
                            key={category.id}
                            onSelect={() => {
                              form.setValue("category", category.id);
                              setPopoverOpen(false);
                            }}
                          >
                            <HiOutlineCheck
                              className={cn(
                                "mr-2 h-4 w-4",
                                category.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Comment</FormLabel>
                <FormControl>
                  <Textarea placeholder="I like it because..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isOnline"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Online</FormLabel>
                </div>
              </FormItem>
            )}
          />
          {!isOnline && (
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="London" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Contact Information</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Link</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://www.website.com/contacts"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem className="mt-4">
            <FormLabel>Hash tags</FormLabel>
            <FormControl>
              <div className="flex justify-stretch items-center flex-wrap gap-2 border border-gray-200 rounded-md p-2">
                {
                  hashtags.map((tag) => {
                    return (
                      <Button key={tag} type="button" className="h-[30px] px-2 text-[12px] py-1 uppercase">
                        {tag} &nbsp;

                        <span
                          className="cursor-pointer font-extrabold"
                          onClick={() => {
                            setHashTags(prevTags => {
                              return prevTags.filter((t) => t !== tag)
                            })
                          }}
                        >
                          X
                        </span>
                      </Button>
                    )
                  })
                }

                <input
                  className="border-none focus-visible:outline-none px-2"
                  onChange={(e) => setTagsInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (tagsInputValue === '' || tagsInputValue === ' ') {
                      setTagsInputValue('')
                      return
                    }

                    if (e.key === " " || e.key === "Enter" || e.key === ",") {
                      e.preventDefault();

                      setHashTags((tags) => {
                        if (tags.includes(tagsInputValue.toLowerCase())) return tags;

                        return [...tags, tagsInputValue.toLowerCase()];
                      });

                      setTagsInputValue('');
                    }
                  }}
                  placeholder="Enter tags"
                  value={tagsInputValue}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>
        <div className="mt-2 flex items-center justify-end">
          <Button onClick={() => { }} className="ml-3" disabled={loading}>
            {loading ? (
              <Fragment>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Fragment>
            ) : (
              <Fragment>
                <HiOutlinePlus className="w-5 h-5 mr-2" />
                Create
              </Fragment>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
