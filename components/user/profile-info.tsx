"use client";

import React from "react";
import { AdminData, ItemsProps, UserData } from "../header/items";
import { UserPlacesListProps } from "../places/user-places";
import Link from "next/link";
import { HiOutlineEmojiSad } from "react-icons/hi";
import PlaceItemByCategory from "../places/place-item-category";
import { Card } from "../ui/card";
import { Session } from "@supabase/supabase-js";
import dayjs from "dayjs";

export function UserProfileInfo({
  userData,
}: {
  userData: ItemsProps["userData"];
}) {
  function calculateAge(dob: string) {
    // Parse the date of birth using dayjs
    const birthDate = dayjs(dob);
    // Get the current date using dayjs
    const currentDate = dayjs();
    // Subtract the birth date from the current date and get the difference in years
    const age = currentDate.diff(birthDate, "year");
    // Return the age as a number
    return age === 0 ? "Unknown" : age.toString();
  }

  return (
    <div className="mt-6 space-y-4">
      <UserInfoCard title="About" content={userData?.short_description} />
      <UserInfoCard title="City" content={userData?.city} />
      <UserInfoCard title="Country" content={userData?.country} />
      <UserInfoCard title="Profession" content={userData?.profession} />
      <UserInfoCard title="Education" content={userData?.education} />
      <UserInfoCard
        title="Age"
        prefix=""
        content={calculateAge(userData?.dob as string)}
      />
      <UserInfoCard title="Website" content={userData?.website} link />
      <UserInfoCard title="Hobbies" content={userData?.hobbies} />
      <UserInfoCard title="Race" content={userData?.race} />
      <UserInfoCard title="Belief" content={userData?.belief} />
    </div>
  );
}

export function UserProfilePlaces({
  places,
  creator,
  session,
}: {
  places: UserPlacesListProps["places"];
  creator: (UserData & { admin: AdminData | null }) | null;
  session: Session | null;
}) {
  return (
    <div className="mt-4">
      {places && places?.length > 0 ? (
        <div className="space-y-5">
          {places.map((category) => {
            return (
              <Card className="p-4" key={category.id}>
                <h2>
                  Category:{" "}
                  <Link
                    className="font-bold"
                    href={`/category/${category.slug}`}
                  >
                    {category.name}
                  </Link>
                </h2>
                {category.places
                  ?.slice()
                  .reverse() // This will reverse the array, showing new items first
                  .map((place) => {
                  return (
                    <PlaceItemByCategory
                      place={place}
                      key={place.id}
                      creator={creator}
                      session={session}
                    />
                  );
                })}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 mx-auto mt-20">
          <HiOutlineEmojiSad className="h-14 w-14 text-zinc-600" />
          <h2 className="text-2xl font-semibold text-zinc-800">
            No Recommendations found
          </h2>
          <p className="text-zinc-500 text-center">
            We couldn&apos;t find any Recommendations submitted by this user
            yet. Please try again in a some time.
          </p>
        </div>
      )}
    </div>
  );
}

function UserInfoCard({
  title,
  content,
  prefix,
  link = false,
}: {
  title: string;
  content?: string | null;
  prefix?: string;
  link?: boolean;
}) {
  if (content && !link) {
    return (
      <div className="border-t border-gray-200 pt-4">
        <h2 className="font-medium text-lg">{title}</h2>
        <p className="mt-2 text-gray-500">
          {prefix} {content}
        </p>
      </div>
    );
  } else if (content && link) {
    return (
      <div className="border-t border-gray-200 pt-4">
        <h2 className="font-medium text-lg">{title}</h2>
        <a
          className="mt-2 text-gray-500 hover:underline hover:text-gray-800"
          href={content}
          rel="noreferrer noopener"
          target="_blank"
        >
          {content}
        </a>
      </div>
    );
  }
  return null;
}
