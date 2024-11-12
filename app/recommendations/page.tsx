import React from "react";
import { getAllPlaces, getSession, getStats } from "../supabase-server";
import AllPlacesList from "@/components/places/all-places";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HiOutlinePlus } from "react-icons/hi";

export default async function Places() {
  const [session, stats] = await Promise.all([
    getSession(),
    getStats(),
  ]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8">
      <div className="items-start justify-between py-4 border-b md:flex">
        <div className="max-w-lg">
          <h3 className="text-gray-800 text-2xl font-bold">Recommendations</h3>
          {stats && (
            <p className="text-gray-600 mt-2">
              <span className="text-black font-bold">
                {stats![0].places_count}
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

      <AllPlacesList />
    </div>
  );
}
