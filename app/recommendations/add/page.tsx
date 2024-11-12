import { getAllCategories, getSession } from "@/app/supabase-server";
import AddPlaceForm from "@/components/places/add";
import { redirect } from "next/navigation";
import React from "react";

export default async function AddPlace() {
  const [session, categories] = await Promise.all([
    getSession(),
    getAllCategories(),
  ]);

  if (!session) return redirect("/login");

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8">
      <div className="items-start justify-between py-4 border-b md:flex">
        <div className="max-w-lg">
          <h3 className="text-gray-800 text-2xl font-bold">
            Add a Recommendation
          </h3>
        </div>
      </div>
      <AddPlaceForm categories={categories} />
    </div>
  );
}
