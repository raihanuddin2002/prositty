"use client";

import React, { Fragment, useEffect, useState } from "react";
import { CategoryData } from "./user-places";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { UserData, AdminData, ItemsProps } from "../header/items";
import { getInitials } from "@/lib/utils";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { useToast } from "../ui/use-toast";
import { Database } from "@/types_db";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import dayjs from "dayjs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  addFavoritePlace,
  addLike,
  getAllCategories,
  removeFavoritePlace,
  removeLike,
} from "@/app/supabase-client";
import {
  HiStar,
  HiOutlineStar,
  HiThumbUp,
  HiHeart,
  HiOutlineHeart,
} from "react-icons/hi";
import AdminControls from "./controls";
import { PlaceItemData } from "./place-item";

export interface PlaceItemByCategoryProps {
  place: PlaceItemData | null;
  creator?: (UserData & { admin: AdminData | null }) | null;
  session?: Session | null;
}

export default function PlaceItemByCategory({
  place,
  creator,
  session = null,
}: PlaceItemByCategoryProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [favorite, setFavorite] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [likes, setLikes] = useState<number | null>(null);
  const [follows, setFollows] = useState<number | null>(null);
  const [userData, setUserData] = useState<PlaceItemByCategoryProps["creator"]>(null);
  const [categoryData, setCategoryData] = useState<CategoryData[] | null>(null);
  const [creatorData, setCreatorData] =
    useState<PlaceItemByCategoryProps["creator"]>(creator);
  const supabase = createClientComponentClient<Database>();

  const { toast } = useToast();

  useEffect(() => {
    async function checkPlace(id: string) {
      const supabase = createClientComponentClient<Database>();

      const { data, error } = await supabase.rpc("is_favorite_and_liked", {
        place_id: id,
      });

      if (error) return console.log(error);

      if (data) {
        setFavorite(data[0].favorite);
        setLiked(data[0].liked);
        setLikes(data[0].likes);
        return;
      }

      setFavorite(false);
      setLiked(false);
    }
    async function countFollows(id: string) {
      const supabase = createClientComponentClient<Database>();

      const { data, error } = await supabase.rpc("count_follows", {
        place_id_to_find: id,
      });

      if (error) return console.log(error);

      if (data) {
        setFollows(data);
        return;
      }

      setFavorite(false);
      setLiked(false);
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

    async function getCreatorData(id: string) {
      try {
        const { data: userDetails } = await supabase
          .from("profiles")
          .select(
            ` 
        *,
        admin:admins(
          *
        )
        `
          )
          .eq("id", id)
          .single();

        setCreatorData(userDetails as ItemsProps["userData"]);
      } catch (error) {
        toast({
          title: "An error has occured!",
          description: "There was an unknown error fetching this user's data.",
          variant: "destructive",
        });
      }
    }

    async function getUserData(id: string) {
      try {
        const { data: userDetails } = await supabase
          .from("profiles")
          .select(
            ` 
        *,
        admin:admins(
          *
        )
        `
          )
          .eq("id", id)
          .single();

        setUserData(userDetails as ItemsProps["userData"]);
      } catch (error) {
        toast({
          title: "An error has occured!",
          description: "There was an unknown error fetching your data.",
          variant: "destructive",
        });
      }
    }

    async function getCategories() {
      const categories = await getAllCategories();
      setCategoryData(categories);
    }

    if (!creatorData) getCreatorData(place?.created_by!);
    if (!userData && session?.user.id) getUserData(session?.user.id);
    if (!categoryData) getCategories();
    if (creatorData?.avatar_url) downloadImage(creatorData?.avatar_url);
    if (place) checkPlace(place.id);
    if (place) countFollows(place.id);
  }, [
    creatorData?.avatar_url,
    supabase,
    toast,
    place?.created_by,
    creatorData,
    place,
    categoryData,
    session?.user.id,
    userData,
  ]);

  const initials = getInitials(creatorData?.full_name);

  return (
    <Card className="p-2 flex flex-row items-center justify-between min-w-[10rem] mt-5">
      <div className="flex flex-row items-center space-x-2 relative">
        <Badge
          className="absolute -top-6 left-0 whitespace-nowrap w-52 md:w-max truncate"
          variant="important"
        >
          {place?.name}
        </Badge>

        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-bold leading-tight">
            Comment
          </span>
          <p className="leading-tight truncate w-20 md:w-48">
            {place?.comment}
          </p>
        </div>
        {place?.city && (
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-bold leading-tight">
              City
            </span>
            <p className="leading-tight">{place?.city}</p>
          </div>
        )}
      </div>
      <div className="flex flex-row relative">
        {session ? (
          <Fragment>
            {likes && liked ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild className="md:block hidden">
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={() => {
                        setLiked(false);
                        setLikes(likes - 1);
                        removeLike(place?.id as string);
                      }}
                    >
                      <div className="flex">
                        <HiHeart className="w-5 h-5 text-red-500 mr-1" />
                        {likes}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent align="center">
                    <p>Remove Like</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild className="md:block hidden">
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={() => {
                        setLiked(true);
                        setLikes(likes! + 1);
                        addLike(place?.id as string);
                      }}
                    >
                      <div className="flex">
                        <HiOutlineHeart className="w-5 h-5 text-gray-600 mr-1" />
                        {likes}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent align="center">
                    <p>Like</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

            )}
            {favorite && follows ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild className="md:block hidden">
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-2 pr-1"
                      onClick={() => {
                        setFavorite(false);
                        setFollows(follows - 1);
                        removeFavoritePlace(place?.id as string);
                      }}
                    >
                      <div className="flex">
                        <HiStar className="w-5 h-5 mx-auto text-yellow-500 mr-1" />
                        {follows}
                      </div>
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
                  <TooltipTrigger asChild className="md:block hidden">
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-2 pr-1"
                      onClick={() => {
                        setFavorite(true);
                        setFollows(follows! + 1);
                        addFavoritePlace(place?.id as string);
                      }}
                    >
                      <div className="flex">
                        <HiOutlineStar className="w-5 h-5 mx-auto text-gray-600 mr-1" />
                        {follows}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent align="center">
                    <p>Favorite</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Fragment>
        ) : null}
        {place?.online && (
          <Badge
            variant="outline"
            className="absolute -top-6 left-10  bg-white"
          >
            Online
          </Badge>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="ml-2">
              View More
            </Button>
          </DialogTrigger>
          <DialogContent className="md:max-w-xl max-w-md">
            <DialogHeader className="flex flex-row justify-between items-center">
              <DialogTitle>{place?.name}</DialogTitle>
              <div className="flex flex-row items-center">
                <Link
                  className="block rounded-full cursor-pointer ring-offset-2 ring-gray-200 ring-2"
                  href={`/user/${creatorData?.username}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      alt={
                        creatorData?.username ||
                        `${creatorData?.username}'s profile picture`
                      }
                      src={avatarUrl || undefined}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Link>
                <Link
                  className="ml-3 font-bold"
                  href={`/user/${creatorData?.username}`}
                >
                  {creatorData?.username /*user name here */}
                </Link>
              </div>
            </DialogHeader>
            <div className="space-y-2">
              <p className="font-bold mb-1">Comment</p>
              <p>{place?.comment}</p>
            </div>
            {place?.contact && (
              <div className="space-y-2">
                <p className="font-bold mb-1">Contact information</p>
                <p>{place?.contact}</p>
              </div>
            )}
            {place?.link && (
              <div className="space-y-2">
                <p className="font-bold mb-1">Link</p>
                <a
                  href={place?.link as string}
                  rel="noreferrer noopener"
                  target="_blank"
                  className="hover:underline text-gray-800"
                >
                  {place?.link}
                </a>
              </div>
            )}
            {place?.tags && (
              <div className="space-y-2">
                <p className="font-bold mb-1">Hash tags</p>

                {
                  place.tags.map((tag) => (
                    <Button key={tag} type="button" className="h-[30px] px-2 text-[10px] py-1 uppercase me-2">
                      {tag}
                    </Button>
                  ))
                }
              </div>
            )}

            <div className="space-y-2 text-gray-600">
              <p>{dayjs(place?.created_at).format("DD/MM/YYYY")}</p>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <AdminControls
                userData={userData}
                place={place}
                categories={categoryData as CategoryData[]}
              />
              {session ? (
                <Fragment>
                  {likes && liked ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setLiked(false);
                              setLikes(likes - 1);
                              removeLike(place?.id as string);
                            }}
                          >
                            <div className="flex">
                              <HiHeart className="w-5 h-5 text-red-500 mr-2" />
                              {likes}
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent align="center">
                          <p>Remove like</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setLiked(true);
                              setLikes(likes! + 1);
                              addLike(place?.id as string);
                            }}
                          >
                            <div className="flex">
                              <HiOutlineHeart className="w-5 h-5 text-gray-600 mr-2" />
                              {likes}
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent align="center">
                          <p>Like</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {favorite ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFavorite(false);
                        removeFavoritePlace(place?.id as string);
                      }}
                    >
                      <HiStar className="w-5 h-5 mr-2 text-yellow-500" />
                      Unfavorite
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFavorite(true);
                        addFavoritePlace(place?.id as string);
                      }}
                    >
                      <HiOutlineStar className="w-5 h-5 mr-2 text-gray-600" />
                      Favorite
                    </Button>
                  )}
                </Fragment>
              ) : null}
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
