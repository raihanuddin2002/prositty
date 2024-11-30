'use client'

import React, { Fragment, useState } from "react";
import { Button } from "../ui/button";
import { PlaceItemByCategoryProps } from "./place-item-category";

import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types_db";
import { useToast } from "../ui/use-toast";
import {
    HiOutlineCheck,
    HiOutlineSave,
    HiOutlineSelector
} from "react-icons/hi";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { addPlaceSchema } from "./add";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { editPlace } from "@/app/supabase-client";
import { cn } from "@/lib/utils";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { Loader2 } from "lucide-react";
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
import { CategoryData } from "../category/list";
import { ScrollArea } from "../ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import { addPlace } from "@/app/supabase-client";
import { PlaceItemData } from "./place-item";

type Props = {
    place: PlaceItemData | null;
    categories?: CategoryData[];
}

export default function PlaceItemCloneModal({ place, categories }: Props) {
    const { toast } = useToast();
    const router = useRouter();
    const supabase = createClientComponentClient<Database>();
    const [loading, setLoading] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [hashtags, setHashTags] = useState(place?.tags || [] as string[]);
    const [tagsInputValue, setTagsInputValue] = useState('')

    const form = useForm<z.infer<typeof addPlaceSchema>>({
        resolver: zodResolver(addPlaceSchema),
        defaultValues: {
            name: place?.name || "",
            comment: "",
            city: place?.city || "",
            isOnline: place?.online || false,
            link: place?.link || "",
            contact: place?.contact || "",
            category: place?.category_id || "",
            tags: hashtags
        },
    });

    const isOnline = form.watch("isOnline");

    async function addItem(values: z.infer<typeof addPlaceSchema>) {
        setLoading(true);
        const result = await addPlace({ ...values, tags: hashtags });

        if (!result.error) {
            toast({
                title: "Success!",
                variant: "success",
                description: `The Recommendation was edited successfully!`,
            });
            form.reset(values);
            setLoading(false);
            return router.refresh();
        } else {
            toast({
                title: "Error!",
                variant: "destructive",
                description: `An unknown server error came up when editing this Recommendation! Try again later.`,
            });
            form.reset();
            setLoading(false);
        }
    }

    return (
        <>
            <ScrollArea className="h-[90vh] p-6">
                <DialogHeader>
                    <DialogTitle>Add {place?.name}</DialogTitle>
                    <DialogDescription>
                        Make edits to the place here, when you are done click apply to
                        save your changes. The user will not be informed of he changes
                        you make.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(addItem)}
                        className="space-y-2 max-w-lg mx-auto mb-6 mr-4 ml-1"
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
                                        <FormDescription>
                                            This is the name of the Recommendation. It can be a
                                            bussiness, point of interest, an online tool or
                                            anything that you want to reccomend!
                                        </FormDescription>
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
                                                            ? categories?.find(
                                                                (category) => category.id === field.value
                                                            )?.name
                                                            : "Select category"}
                                                        <HiOutlineSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-96 p-0 z-[1002]">
                                                <Command>
                                                    <CommandInput placeholder="Search categories..." />
                                                    <CommandEmpty>No category found.</CommandEmpty>
                                                    <CommandGroup>
                                                        <ScrollArea className="h-[50vh]">
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
                                                        </ScrollArea>
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>
                                            This is the category that the new Recommendation will
                                            be a placed under.
                                        </FormDescription>
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
                                            <Input
                                                placeholder="I like it because..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Add a short comment about the place you are
                                            recommending.
                                        </FormDescription>
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
                                            <FormDescription>
                                                Select this if the Recommendation has no physical
                                                location and is purely online.
                                            </FormDescription>
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
                                                <Input placeholder="Vilnius" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Add a city in which the Recommendation is located.
                                            </FormDescription>
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
                                            <Input
                                                placeholder="Phone: ... Address: ..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Add some contact details to the Recommendation you are
                                            recommending.
                                        </FormDescription>
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
                                        <FormDescription>
                                            Add a link which leads to information about the
                                            Recommendation you are recommending.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Tags */}
                            <FormItem className="mt-4">
                                <FormLabel>Hash tags</FormLabel>
                                <FormControl>
                                    <div className="flex justify-stretch items-center flex-wrap gap-2 border border-gray-200 rounded-md p-2">
                                        {
                                            hashtags?.map((tag) => {
                                                return (
                                                    <Button key={tag} type="button" className="h-[30px] px-2 text-[12px] py-1 uppercase">
                                                        {tag} &nbsp;

                                                        <span
                                                            className="cursor-pointer font-extrabold pe-2"
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
                                                        if (tags?.includes(tagsInputValue.toLowerCase())) return tags;
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
                            <Button type="submit" className="ml-3" disabled={loading}>
                                {loading ? (
                                    <Fragment>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Please wait
                                    </Fragment>
                                ) : (
                                    <Fragment>
                                        <HiOutlineSave className="w-5 h-5 mr-2" />
                                        Create
                                    </Fragment>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </ScrollArea>
        </>
    )
}
