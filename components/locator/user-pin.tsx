"use client";

import { AdvancedMarker } from "@vis.gl/react-google-maps";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";
import { useToast } from "../ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types_db";
import { UserData, AdminData } from "../header/items";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserPin({
  user,
}: {
  user: (UserData & { admin: AdminData | null }) | null;
}) {
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

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
        // toast({
        //   title: "An error has occured!",
        //   description:
        //     "There was an unknown error fetching this userData's profile picture.",
        //   variant: "destructive",
        // });
      }
    }

    if (user?.avatar_url) downloadImage(user?.avatar_url);
  }, [supabase, toast, user?.avatar_url]);

  const initials = getInitials(user?.full_name);
  return (
    <AdvancedMarker
      gmpClickable={true}
      onClick={() =>
        router.push(`/user/${encodeURIComponent(user?.username as string)}`)
      }
      className="bg-white/90 rounded-lg p-1.5"
      position={{
        lat: user?.location?.coordinates[1] as number,
        lng: user?.location?.coordinates[0] as number,
      }}
    >
      <Avatar className="h-9 w-9 mx-auto">
        <AvatarImage
          alt={user?.username || `${user?.username}'s profile picture`}
          src={avatarUrl || undefined}
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <p className="font-bold">{user?.username}</p>
    </AdvancedMarker>
  );
}
