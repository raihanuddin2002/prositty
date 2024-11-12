"use client";

import React, { useEffect, useState } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { getClosestUsers } from "@/app/supabase-client";
import { Session } from "@supabase/supabase-js";
import { AdminData, ItemsProps, UserData } from "../header/items";
import { CgSpinner } from "react-icons/cg";
import UserPin from "./user-pin";

export default function Locator({
  session,
  userData,
}: {
  session: Session | null;
  userData: ItemsProps["userData"];
}) {
  const [closestUsers, setClosestUsers] = useState<
    (UserData & { admin: AdminData | null })[] | null
  >(null);

  useEffect(() => {
    async function getUsers() {
      const users = await getClosestUsers();
      setClosestUsers(
        users as (UserData & { admin: AdminData | null })[] | null
      );
    }
    getUsers();
  }, [session]);


  console.log(process.env.NEXT_PUBLIC_MAPS_API_KEY);


  if (!closestUsers)
    return (
      <div className="flex flex-row items-center justify-center">
        <CgSpinner className="w-10 h-10 text-gray-600 animate-spin mr-2" />
        <p className="text-lg">Loading...</p>
      </div>
    );

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY as string}>
      <Map
        zoom={11}
        center={{
          lat: userData?.location?.coordinates[1] as number,
          lng: userData?.location?.coordinates[0] as number,
        }}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        mapId="cbe64bbb3d6efc19"
        className="w-full h-[65vh] rounded-lg mt-3"
      >
        {closestUsers.map((user) => (
          <UserPin user={user} key={user.id} />
        ))}
      </Map>
    </APIProvider>
  );
}