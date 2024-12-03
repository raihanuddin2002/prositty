"use client";

import { executeSearchByHashtag, executeSearchByQuery } from "@/app/supabase-client";
import { Database } from "@/types_db";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";
import { Card } from "../ui/card";
import PlaceItemByCategory, { PlaceItemByCategoryData } from "../places/place-item-category";
import UserItem from "../user/user-item";
import { AdminData, UserData } from "../header/items";
import { Session } from "@supabase/supabase-js";

export interface SearchResults {
  places: PlaceItemByCategoryData[] | null;
  categories: Database["public"]["Tables"]["categories"]["Row"][] | null;
  users: (UserData & { admin: AdminData | null })[] | null;
}

export interface HashtagResults {
  places: PlaceItemByCategoryData[] | null
}

export default function SearchResults({
  session,
}: {
  session: Session | null;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<SearchResults>();
  const [hashtagResults, setHashtagResults] = useState<HashtagResults | null>(null)

  const searchParams = useSearchParams();
  const query = searchParams?.get("q");
  const hashtag = searchParams?.get('hashtag')

  useEffect(() => {
    async function SearchItems(query: string) {
      try {
        const results = await executeSearchByQuery(query)
        setResults(results)
      } catch (error) {
        console.log(error)
      }
      finally {
        setLoading(false)
      }
    }
    if (query && !results) SearchItems(query);
  }, [query, results])

  // hastag search
  useEffect(() => {
    async function SearchItems(hashtag: string) {
      try {
        const results = await executeSearchByHashtag(hashtag);
        setHashtagResults(results)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    if (hashtag && !hashtagResults) SearchItems(hashtag);
  }, [hashtag, results, hashtagResults])

  if (loading)
    return (
      <div className="text-xl font-semibold mx-auto mt-36 w-fit flex flex-col items-center justify-center">
        <Loader2 className="mr-2 h-16 w-16 animate-spin" />
        Please wait...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-gray-800 text-xl font-bold my-2">Search results</h2>
      <div className="space-y-3">
        <Card className="p-3 flex flex-col">
          <h3 className="font-semibold text-gray-900 text-lg">
            Recommendations
          </h3>

          {hashtag && <>
            {
              hashtag && hashtagResults?.places && hashtagResults.places.length > 0 ? (
                <div className="flex flex-col space-y-5">
                  {hashtagResults?.places?.map((place) => (
                    <PlaceItemByCategory place={place} key={place.id} session={session} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 font-semibold mx-auto my-2">
                  No Recommendations were found in this search!
                </p>
              )
            }
          </>}

          {query && <>
            {results?.places && results?.places?.length > 0 ? (
              <div className="flex flex-col space-y-5">
                {results?.places?.map((place) => (
                  <PlaceItemByCategory place={place} key={place.id} session={session} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 font-semibold mx-auto my-2">
                No Recommendations were found in this search!
              </p>
            )}
          </>}
        </Card>

        {query && <Card className="space-y-4 p-3 flex flex-col">
          <h3 className="font-semibold text-gray-900 text-lg">Users</h3>
          {results?.users && results.users.length > 0 ? (
            <Fragment>
              {results?.users?.map((user) => (
                <UserItem userData={user} key={user.id} session={session} />
              ))}
            </Fragment>
          ) : (
            <p className="text-gray-600 font-semibold mx-auto my-2">
              No users were found in this search!
            </p>
          )}
        </Card>}
      </div>
    </div >
  );
}
