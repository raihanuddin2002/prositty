"use client";
import React, { Fragment, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { CategoryData } from "./list";
import { addCategory, getParentCategories } from "@/app/supabase-client";
import { useToast } from "../ui/use-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";

export const addCategorySchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "The name is too short (minimum 2 characters)!" })
      .max(50, { message: "The name is too long (maximum 50 characters)!" }),
    child: z.boolean().default(false),
    parent: z.string().nullable().default(null),
  })
  .refine(
    // the function that checks the if child is selected
    (data) => data.child === false || data.parent !== null,
    // the error message if the condition is not met
    { message: "Parent is required if the category is a child!" }
  );

export default function AddCategory() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [parentCategories, setParentCategories] = useState<
    CategoryData[] | null
  >(null);

  const form = useForm<z.infer<typeof addCategorySchema>>({
    resolver: zodResolver(addCategorySchema),
    defaultValues: {
      name: "",
      child: false,
      parent: null,
    },
  });

  useEffect(() => {
    async function getCategories() {
      const categories = await getParentCategories();
      setParentCategories(categories);
    }

    if (open) {
      getCategories();
    }
  }, [open]);

  const isChild = form.watch("child");
  const parentCategoriesExist =
    parentCategories && parentCategories?.length > 0;

  async function onSubmit(values: z.infer<typeof addCategorySchema>) {
    setLoading(true);
    const result = await addCategory(values);

    if (result.error?.code === "23505") {
      //duplicate name
      form.setError("name", { message: "This name already exists!" });
      setLoading(false);
      return toast({
        title: "An error has occured!",
        description: "This category name already exists.",
        variant: "destructive",
      });
    } else if (result.data) {
      //no errors
      toast({
        title: "Success!",
        description: `The category ${result.data[0].name} was created successfully!`,
      });
    }

    form.reset();
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger className="mt-6 md:mt-0" asChild>
        <Button>Add a category</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <AlertDialogHeader>
              <AlertDialogTitle>Add a new category</AlertDialogTitle>
              <AlertDialogDescription>
                Fill in the data below to create a new category.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category name</FormLabel>
                    <FormControl>
                      <Input placeholder="Shopping malls" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name of the category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="child"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!parentCategoriesExist}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        This category is a child of another category
                      </FormLabel>
                      <FormDescription>
                        Select this if the category has a parent, and leave it
                        unchecked if the category is top-level.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              {isChild && (
                <FormField
                  control={form.control}
                  name="parent"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-4">
                      <FormLabel className="mb-1">Parent category</FormLabel>
                      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-80 justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? parentCategories?.find(
                                    (category) => category.id === field.value
                                  )?.name
                                : "Select category"}
                              <HiOutlineSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>

                        <PopoverContent className="w-80 p-0">
                          <ScrollArea className="h-80">
                            <Command>
                              <CommandInput placeholder="Search categories..." />
                              <CommandEmpty>No category found.</CommandEmpty>

                              <CommandGroup>
                                {parentCategories?.map((category) => (
                                  <CommandItem
                                    key={category.id}
                                    onSelect={() => {
                                      form.setValue("parent", category.id);
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
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        This is the parent category that the new category will
                        be a child of.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <div className="mt-2 flex items-center justify-end">
              <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
              <Button type="submit" className="ml-3" disabled={loading}>
                {loading ? (
                  <Fragment>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </Fragment>
                ) : (
                  <Fragment>
                    <HiOutlinePlus className="w-5 h-5 mr-2" />
                    Add
                  </Fragment>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
