"use client";

import React, { Fragment, useEffect, useState } from "react";
import {
  HiOutlineCheck,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineSelector,
  HiOutlineTrash,
} from "react-icons/hi";
import { Button } from "../ui/button";
import { CategoryPlacesProps } from "./category-places";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types_db";
import * as z from "zod";
import { addCategorySchema } from "./add";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategoryData } from "./list";
import { editCategory, getParentCategories } from "@/app/supabase-client";
import { Command, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommandInput, CommandEmpty, CommandGroup, CommandItem } from "cmdk";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from "../ui/form";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";

export default function CategoryControls({
  category,
}: {
  category: CategoryPlacesProps["category"];
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [parentCategories, setParentCategories] = useState<
    CategoryData[] | null
  >(null);

  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof addCategorySchema>>({
    resolver: zodResolver(addCategorySchema),
    defaultValues: {
      name: category?.name || "",
      child: category.is_child || false,
      parent: category.parent_id || "",
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

  async function deleteItem() {
    const { data, error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category?.id as string);

    if (error) {
      return toast({
        title: "There was an error deleting the category!",
        description: "Try again later.",
        variant: "destructive",
      });
    }

    toast({
      title: "Success!",
      description: "This category has been successfully deleted.",
    });

    return router.replace("/");
  }

  async function editItem(values: z.infer<typeof addCategorySchema>) {
    setLoading(true);
    const result = await editCategory(values, category?.id as string);

    if (!result.error) {
      toast({
        title: "Success!",
        variant: "success",
        description: `The category was edited successfully!`,
      });
      form.reset();
      setLoading(false);
      setOpen(false);
      return router.refresh();
    } else {
      toast({
        title: "Error!",
        variant: "destructive",
        description: `An unknown server error came up when editing this category! Try again later.`,
      });
      form.reset();
      setLoading(false);
    }
  }

  const isChild = form.watch("child");
  const parentCategoriesExist =
    parentCategories && parentCategories?.length > 0;

  return (
    <div className="flex flex-row space-x-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <HiOutlinePencil className="w-5 h-5 mr-1" /> Edit
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {category?.name}</DialogTitle>
            <DialogDescription>
              Make edits to the category here, when you are done click apply to
              save your changes. The user will not be informed of he changes you
              make.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(editItem)} className="space-y-2">
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
                        <Popover
                          open={popoverOpen}
                          onOpenChange={setPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-96 justify-between",
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
                          <PopoverContent className="w-96 p-0">
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
                <Button type="submit" className="ml-3" disabled={loading}>
                  {loading ? (
                    <Fragment>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </Fragment>
                  ) : (
                    <Fragment>
                      <HiOutlinePencil className="w-5 h-5 mr-2" />
                      Edit
                    </Fragment>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <HiOutlineTrash className="w-5 h-5 mr-1" /> Delete category
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              category and all the Reccomendations with it.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteItem}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
