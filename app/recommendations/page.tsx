import React from "react";
import { getAllCategories, getAllPlaces, getSession, getStats, getUserDetails } from "../supabase-server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HiOutlineEmojiSad, HiOutlinePlus } from "react-icons/hi";
import RecommendationFilter from "./recommendation-filter";

export default async function Places() {
  const [session, places, userData, categories] = await Promise.all([
    getSession(),
    getAllPlaces(),
    getUserDetails(),
    getAllCategories(),
    getStats()
  ])

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8">
      <div className="items-start justify-between py-4 border-b md:flex">
        <div className="max-w-lg">
          <h3 className="text-gray-800 text-2xl font-bold">Recommendations</h3>
          {places && (
            <p className="text-gray-600 mt-2">
              <span className="text-black font-bold">
                {places.length}
              </span>{" "}
              Reccomendations in total.
            </p>
          )}
        </div>
        {session && (
          <Button asChild className="mt-2 md:mt-0">
            <Link href="/recommendations/add">
              <HiOutlinePlus className="w-5 h-5 mr-1" />
              Add a Recommendation
            </Link>
          </Button>
        )}
      </div>

      <section className="mt-3">
        <div className="flex flex-col space-y-5">
          <RecommendationFilter
            places={places}
            session={session}
            categories={categories}
            userData={userData}
          />
        </div>
      </section>

    </div>
  );
}
