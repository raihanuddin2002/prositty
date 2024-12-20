"use client";

import { Database } from "@/types_db";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";
import { AdminData, UserData } from "../header/items";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";
import { useToast } from "../ui/use-toast";
import { Card } from "../ui/card";
import { HiOutlineEmojiSad } from "react-icons/hi";
import PlaceItemByCategory, { PlaceItemData } from "./place-item";
import Link from "next/link";
import PlaceItem from "./place-item";

export type CategoryData = Database["public"]["Tables"]["categories"]["Row"];

export interface UserPlacesListProps {
  session: Session | null;
  userData: (UserData & { admin: AdminData | null }) | null;
  places: (CategoryData & { places: PlaceItemData[] | null })[] | null;
}

export default function UserPlacesList({
  session,
  userData,
  places,
}: UserPlacesListProps) {
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage
          .from("avatars")
          .download(path);
        if (error) {
          throw error;
        }

        const url = URL.createObjectURL(data);
        setAvatarUrl(url);
      } catch (error) {
        toast({
          title: "An error has occured!",
          description:
            "There was an unknown error fetching your profile picture.",
          variant: "destructive",
        });
      }
    }

    if (userData?.avatar_url) downloadImage(userData?.avatar_url);
  }, [userData?.avatar_url, supabase, toast]);

  const initials = getInitials(userData?.full_name);

  return (
    <div className="p-4 md:p-8 flex flex-col items-center justify-center mx-auto">
      <div className="flex items-center gap-4 mb-6 mt-4 md:mt-0 md:mb-8">
        <label
          className="block rounded-full cursor-pointer ring-offset-2 ring-gray-200 ring-2 hover:ring-primary transition-all duration-100"
          htmlFor="image"
        >
          <Avatar className="h-20 w-20">
            <AvatarImage
              alt={userData?.full_name || "Your user image"}
              src={avatarUrl || undefined}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </label>
        <div>
          <div className="text-2xl font-bold">
            {userData?.full_name || userData?.username}
          </div>
          <div className="text-zinc-500 dark:text-zinc-400">
            {session?.user.email}
          </div>
        </div>
      </div>
      {places && places?.length > 0 ? (
        <div className="flex flex-col space-y-5">
          {places.map((category) => {
            return (
              <Card className="p-4" key={category.id}>
                <h2 className="text-lg">
                  Category:{" "}
                  <Link
                    className="font-bold"
                    href={`/category/${category.slug}`}
                  >
                    {category.name}
                  </Link>
                </h2>
                {category.places && category.places.length > 0 &&
                  category.places?.map((place) => {
                    return (
                      <PlaceItem
                        place={place}
                        key={place.id}
                        userData={userData}
                        session={session}
                      />
                    );
                  })}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 w-1/3 mx-auto mt-20">
          <HiOutlineEmojiSad className="h-14 w-14 text-zinc-600" />
          <h2 className="text-2xl font-semibold text-zinc-800">
            No Recommendations found
          </h2>
          <p className="text-zinc-500 text-center">
            We couldn&apos;t find any Recommendations submitted by this user
            yet.
          </p>
        </div>
      )}
    </div>
  );
}
