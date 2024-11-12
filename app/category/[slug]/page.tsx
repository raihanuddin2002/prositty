import {
  getCategoryBySlug,
  getSession,
  getUserDetails,
} from "@/app/supabase-server";
import CategoryPlaces from "@/components/category/category-places";
import CategoryControls from "@/components/category/controls";
import React from "react";
import { HiOutlineEmojiSad } from "react-icons/hi";

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const [categoryData, userData, session] = await Promise.all([
    getCategoryBySlug(params.slug),
    getUserDetails(),
    getSession(),
  ]);

  if (!categoryData)
    return (
      <div className="flex flex-col items-center justify-center space-y-4 w-5/6 md:w-1/3 mx-auto mt-48">
        <HiOutlineEmojiSad className="h-20 w-20 text-zinc-600" />
        <h2 className="text-2xl font-semibold text-zinc-800">
          This category is empty or doesn&apos;t exist
        </h2>
        <p className="text-zinc-500 text-center">
          We couldn&apos;t find any Reccomendations in the category{" "}
          <span className="font-bold">{params.slug}</span>. Add a reccomendation
          or check if the url is correct.
        </p>
      </div>
    );

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8">
      <div className="items-start justify-between py-4 border-b md:flex">
        <div className="max-w-xl">
          <h3 className="text-gray-800 text-2xl font-bold">
            {categoryData.name}
          </h3>
          <p className="text-gray-600 mt-2">
            <span className="text-black font-bold">
              {categoryData.places?.length}
            </span>{" "}
            reccomendations in total.
          </p>
        </div>
        {userData?.admin?.valid && (
          <div className="mt-3 md:mt-0">
            <CategoryControls category={categoryData} />
          </div>
        )}
      </div>
      <CategoryPlaces category={categoryData} session={session} />
    </div>
  );
}
