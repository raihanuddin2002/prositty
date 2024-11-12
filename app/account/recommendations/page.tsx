import {
  getSession,
  getUserDetails,
  getUserPlaces,
} from "@/app/supabase-server";
import UserPlacesList from "@/components/places/user-places";
import { redirect } from "next/navigation";
import React from "react";

export default async function UserPlaces() {
  const [session, places, userData] = await Promise.all([
    getSession(),
    getUserPlaces(),
    getUserDetails(),
  ]);

  if (!session) {
    return redirect("/login");
  }

  return (
    <UserPlacesList session={session} places={places} userData={userData} />
  );
}
