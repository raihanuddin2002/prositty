import React from "react";
import { HiOutlineEmojiSad } from "react-icons/hi";
import { getAllCategories, getAllPlaces, getSession, getUserDetails } from "@/app/supabase-server";
import PlaceItem from "./place-item";

export default async function AllPlacesList() {
  const [session, places, userData, categories] = await Promise.all([getSession(), getAllPlaces(), getUserDetails(), getAllCategories()])
  // console.log(places)
  return (
    <section className="mt-6">
      {places && places?.length > 0 ? (
        <div className="flex flex-col space-y-5">

          {places.map((place) => {
            return (
              <PlaceItem
                key={place.id}
                place={place}
                session={session}
                categories={categories}
                userData={userData}
              />
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 w-1/3 mx-auto mt-20">
          <HiOutlineEmojiSad className="h-14 w-14 text-zinc-600" />
          <h2 className="text-2xl font-semibold text-zinc-800">
            No Recommendations found
          </h2>
          <p className="text-zinc-500 text-center">
            We couldn&apos;t find any Recommendations submitted by users yet.
            Please try again, and if you haven&apos;t created a Recommendation,
            create one!
          </p>
        </div>
      )}
    </section>
  );
}
