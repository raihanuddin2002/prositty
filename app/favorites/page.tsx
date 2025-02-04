import { Card } from "@/components/ui/card";
import UserItem from "@/components/user/user-item";
import React, { Fragment } from "react";
import { getAllFavorites, getSession, getUserDetails } from "../supabase-server";
import { AdminData, UserData } from "@/components/header/items";
import PlaceItem, { PlaceItemData } from "@/components/places/place-item";

type UserProfile = (UserData & { admin: AdminData | null }) | null;

export default async function Favorites() {
  const [favorites, userData, session] = await Promise.all([
    getAllFavorites(),
    getUserDetails(),
    getSession(),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-gray-800 text-xl font-bold my-2">My Favorites</h2>
      <div className="space-y-3">
        <Card className="p-3 flex flex-col">
          <h3 className="font-semibold text-gray-900 text-lg">
            Favorite Recommendations
          </h3>
          {favorites?.favoritePlaces && favorites?.favoritePlaces?.length > 0 ? (
            <div className="flex flex-col space-y-5">
              {favorites.favoritePlaces
                .filter(place => place?.place)
                .map((place, index) => {
                  if (!place?.place) return null

                  return (
                    <PlaceItem
                      key={place?.place?.id || index}
                      place={place?.place as PlaceItemData || null}
                      userData={userData}
                      session={session}
                    />
                  )
                })}
            </div>
          ) : (
            <p className="text-gray-600 font-semibold mx-auto my-2">
              You have no favorited Recommendations!
            </p>
          )}
        </Card>
        <Card className="space-y-4 p-3 flex flex-col">
          <h3 className="font-semibold text-gray-900 text-lg">
            Favorite users
          </h3>
          {favorites.favoriteUsers && favorites.favoriteUsers.length > 0 ? (
            <Fragment>
              {favorites.favoriteUsers.map((user, idx) => (
                <UserItem
                  userData={user.profile as unknown as UserProfile}
                  session={session}
                  key={idx}
                />
              ))}
            </Fragment>
          ) : (
            <p className="text-gray-600 font-semibold mx-auto my-2">
              You have no favorited users!
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
