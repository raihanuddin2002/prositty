import {
  getUserDetails,
  getCategories,
  getMostActiveUsers,
  getLatestPlaces,
  getAllCategories,
  createServerSupabaseClient,
} from "@/app/supabase-server";
import React from "react";
import { HiOutlinePlus } from "react-icons/hi";
import Locator from "../locator/locator";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import UserItem from "../user/user-item";
import { Session } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import PlaceItem from "../places/place-item";

export default async function Dashboard({
  session,
}: {
  session: Session | null;
}) {
  const userData = await getUserDetails();
  const userCity = userData?.city || "Default City";
  const [categories, mostActiveUsers, latestPlaces, allCategories] =
    await Promise.all([
      getCategories(),
      getMostActiveUsers(),
      getLatestPlaces(userCity),
      getAllCategories()
    ]);

  return (
    <main className="container px-4 md:px-8">
      <div className="grid grid-cols-12">
        <div className="hidden lg:block lg:col-span-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Categories</h3>
            {userData?.admin?.valid && (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/categories">
                  <HiOutlinePlus className="w-5 h-5 text-gray-700" />
                </Link>
              </Button>
            )}
          </div>
          <div className="flex flex-col space-y-4 mt-2 mr-1">
            {categories?.map((category) => (
              <div className="grid gap-6 relative group" key={category?.id}>
                <div className="flex flex-col space-y-1">
                  <Link
                    className="font-semibold"
                    href={`/category/${category?.slug}`}
                  >
                    {category?.name}
                  </Link>
                  <ul className="pl-3">
                    {category?.children.map((subcategory) => (
                      <li key={subcategory.id}>
                        <Link href={`/category/${subcategory.slug}`}>
                          {subcategory.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-full lg:col-span-10 p-1 lg:p-2 space-y-4">
          <Card className="w-full p-4">
            <h2 className="text-lg font-bold">Locator</h2>
            {/*             <p className="text-gray-400">Locate users that are close to you</p> */}
            <Locator session={session} userData={userData} />
          </Card>
          <Card className="w-full p-4">
            <h2 className="text-lg font-bold">Most active users</h2>
            <p className="text-gray-400">
              {/*               View the most active users that have the latest interactions. */}
            </p>
            <div className="space-y-4 mt-2">
              {mostActiveUsers?.map((user) => (
                <UserItem userData={user} key={user.id} session={session} />
              ))}
            </div>
          </Card>
          <Card className="w-full p-4">
            <div className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-bold">The latest Recommendations</h2>
              <Button asChild variant="ghost">
                <Link href="/recommendations/add">
                  <HiOutlinePlus className="w-5 h-5 mr-1" />
                  <span className="hidden md:block">Add a Recommendation</span>
                </Link>
              </Button>
            </div>

            <div className="flex flex-col space-y-5 mt-2">
              {latestPlaces?.map((place) => {
                return (
                  <PlaceItem
                    key={place.id}
                    place={place}
                    session={session}
                    userData={userData}
                    categories={allCategories}
                    itemsBy={true}
                  />
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
