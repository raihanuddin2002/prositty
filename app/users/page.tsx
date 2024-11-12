import React from "react";
import { getAllUsers, getStats } from "../supabase-server";
import UserFilter from "./UserFilter";

export default async function AllUsers() {
  const [users, stats] = await Promise.all([getAllUsers(), getStats()]);

  return (
    <main className="max-w-screen-xl mx-auto px-4 md:px-8">
      <div className="items-end justify-between py-4 border-b md:flex">
        <div className="max-w-lg">
          <h3 className="text-gray-800 text-2xl font-bold">Users</h3>
          {stats && (
            <p className="text-gray-600 mt-2">
              <span className="text-black font-bold">
                {stats[0].profiles_count}
              </span>{" "}
              users in total.
            </p>
          )}
        </div>
      </div>

      {/* Pass users or an empty array to avoid null issues */}
      <UserFilter users={users || []} />
    </main>
  );
}