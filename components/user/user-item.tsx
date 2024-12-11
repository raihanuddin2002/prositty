"use client";

import { getInitials } from "@/lib/utils";
import { Database } from "@/types_db";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import Link from "next/link";
import { HiOutlineStar, HiStar } from "react-icons/hi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { addFavoriteUser, removeFavoriteUser } from "@/app/supabase-client";

interface UserData {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  city: string | null;
  country: string | null;
  belief: string | null;
  gender: "male" | "female" | "other" | null; // Ensure this matches your User interface
}

interface AdminData {
  adminRole: string;
}

interface UserItemProps {
  userData: UserData | null; //before: (UserData & { admin: AdminData | null }) | null;
  session?: Session | null;
}

export default function UserItem({ userData, session = null }: UserItemProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [favorite, setFavorite] = useState<boolean>(false);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function checkIfFavoriteUser(id: string) {
      const supabase = createClientComponentClient<Database>();

      const { data, error } = await supabase
        .from("favorite-users")
        .select()
        .eq("user_id", id);

      if (error) console.log(error);

      if (data && data?.length > 0) return setFavorite(true);

      return setFavorite(false);
    }

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
        console.log("Error downloading image:", error);
      }
    }

    if (userData?.avatar_url) downloadImage(userData?.avatar_url);
    if (userData) checkIfFavoriteUser(userData.id);
  }, [supabase, userData]);

  const initials = getInitials(userData?.full_name);

  return (
    <Card className="p-2 flex flex-row items-center justify-between space-x-3">
      <div className="flex flex-row items-center space-x-3">
        <div className="ring-offset-2 ring-gray-200 ring-2 rounded-full block">
          <Avatar className="h-9 w-9">
            <AvatarImage
              alt={userData?.username || `${userData?.username}'s profile picture`}
              src={avatarUrl || undefined}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
        <h1 className="text-lg font-bold">{userData?.username}</h1>
      </div>

      <div className="flex items-center space-x-2">
        {userData?.city && (
          <p className="text-gray-500 hidden md:block">
            <span className="text-gray-600 font-bold">{userData?.city}</span>
          </p>
        )}
        {session ? (
          favorite ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="hidden md:block">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setFavorite(false);
                      removeFavoriteUser(userData?.id as string);
                    }}
                  >
                    <HiStar className="w-5 h-5 mx-auto text-yellow-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="center">
                  <p>Unfavorite</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="hidden md:block">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setFavorite(true);
                      addFavoriteUser(userData?.id as string);
                    }}
                  >
                    <HiOutlineStar className="w-5 h-5 mx-auto text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="center">
                  <p>Favorite</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        ) : null}
        <Button asChild variant="outline">
          <Link href={`/user/${encodeURIComponent(userData?.username as string)}`}>
            View profile
          </Link>
        </Button>
      </div>
    </Card>
  );
}
