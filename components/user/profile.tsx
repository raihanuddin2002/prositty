"use client";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ItemsProps } from "../header/items";
import { getInitials } from "@/lib/utils";
import { useToast } from "../ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types_db";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { UserProfileInfo, UserProfilePlaces } from "./profile-info";
import { UserPlacesListProps } from "../places/user-places";
import { Button } from "../ui/button";
import { HiOutlineStar, HiOutlineTrash, HiStar } from "react-icons/hi";
import { addFavoriteUser, removeFavoriteUser } from "@/app/supabase-client";
import { deleteUser } from "@/app/supabase-actions";
import { useRouter } from "next/navigation";

dayjs.extend(relativeTime);

export interface UserInfoProps extends ItemsProps {
  places: UserPlacesListProps["places"];
  isAdmin: boolean;
}

export default function UserProfileView({
  userData,
  session,
  places,
  isAdmin,
}: UserInfoProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [favorite, setFavorite] = useState<boolean>(false);
  const supabase = createClientComponentClient<Database>();

  const { toast } = useToast();
  const router = useRouter();

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
        // toast({
        //   title: "An error has occured!",
        //   description:
        //     "There was an unknown error fetching this user's profile picture.",
        //   variant: "destructive",
        // });
      }
    }

    if (userData?.avatar_url) downloadImage(userData?.avatar_url);
    if (userData) checkIfFavoriteUser(userData.id);
  }, [userData?.avatar_url, supabase, toast, userData]);

  const initials = getInitials(userData?.full_name);

  const totalCountOfPlaces = places
    ? places.reduce((acc, category) => {
        return acc + (category.places ? category.places.length : 0);
      }, 0)
    : 0;

  
  return (
    <div className="max-w-5xl mx-auto flex flex-col md:grid md:grid-cols-3">
      <div className="p-6 col-span-1">
        <div className="flex items-center space-x-4">
          <div className="ring-offset-2 ring-gray-200 ring-2 rounded-full block">
            <Avatar className="h-20 w-20">
              <AvatarImage
                alt={
                  userData?.username ||
                  `${userData?.username}'s profile picture`
                }
                src={avatarUrl || undefined}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>

          <div>
            <div className="flex flex-row items-center justify-start">
              <h1 className="text-2xl font-bold">{userData?.username}</h1>
            </div>

            <p className="text-gray-500">
              Joined{" "}
              <span className="text-gray-600 font-bold">
                {dayjs(userData?.created_at).format("MMMM YYYY")}
              </span>
            </p>
            <p className="text-gray-500">
              Last active{" "}
              <span className="text-gray-600 font-bold">
                {dayjs().to(dayjs(userData?.last_active))}
              </span>
            </p>
          </div>
        </div>
        {session ? (
          favorite ? (
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => {
                setFavorite(false);
                removeFavoriteUser(userData?.id as string);
              }}
            >
              <HiStar className="w-5 h-5 mr-2 text-yellow-500" />
              Unfavorite
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => {
                setFavorite(true);
                addFavoriteUser(userData?.id as string);
              }}
            >
              <HiOutlineStar className="w-5 h-5 mr-2 text-gray-600" />
              Favorite
            </Button>
          )
        ) : null}
        {isAdmin && userData?.id != session?.user.id && (
          <Button
            variant="destructive"
            className="w-full mt-2"
            onClick={async () => {
              const error = await deleteUser(userData?.id as string);
              if (error) {
                toast({
                  title: "An error occurred!",
                  description: "An error occurred while deleting the user!",
                  variant: "destructive",
                });
              } else {
                toast({
                  title: "Success!",
                  description: "The user was deleted successfully!",
                  variant: "success",
                });
                router.replace("/users");
              }
            }}
          >
            <HiOutlineTrash className="w-5 h-5 mr-2" />
            Delete User
          </Button>
        )}
        <UserProfileInfo userData={userData} />
      </div>
      <div className="p-6 col-span-2">
        <p className="text-gray-600 mt-2 text-center">
          <span className="text-black font-bold">{totalCountOfPlaces}</span>{" "}
          reccomendations.
        </p>
        <UserProfilePlaces
          places={places}
          creator={userData}
          session={session}
        />
      </div>
    </div>
  );
}
