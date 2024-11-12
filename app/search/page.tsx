import SearchInput from "@/components/search/search-input";
import SearchResults from "@/components/search/search-results";
import React from "react";
import { getSession } from "../supabase-server";

export default async function page() {
  const [session] = await Promise.all([getSession()]);

  return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8">
      <div className="items-end justify-between py-4 border-b md:flex">
        <div className="max-w-lg">
          <h3 className="text-gray-800 text-2xl font-bold">Search</h3>
        </div>
        <SearchInput />
      </div>
      <SearchResults session={session} />
    </main>
  );
}
