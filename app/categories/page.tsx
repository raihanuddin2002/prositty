import React from "react";
import { getCategories, getStats, getUserDetails } from "../supabase-server";
import AddCategory from "@/components/category/add";
import CategoryList from "@/components/category/list";

export default async function Categories() {
  const [userData, categories, stats] = await Promise.all([
    getUserDetails(),
    getCategories(),
    getStats(),
  ]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8">
      <div className="items-start justify-between py-4 border-b md:flex">
        <div className="max-w-lg">
          <h3 className="text-gray-800 text-2xl font-bold">Categories</h3>
          <p className="text-gray-600 mt-2">
            <span className="text-black font-bold">
              {stats![0].places_count}
            </span>{" "}
            Reccommendations in total
          </p>
        </div>
        {userData?.admin?.valid && <AddCategory />}
      </div>
      <CategoryList categories={categories} />
    </div>
  );
}
