"use client";

import React from "react";
import { CategoryData } from "./list";
import PlaceItem, { PlaceItemData, PlaceItemProps } from "../places/place-item";
import { Session } from "@supabase/supabase-js";
import { UserData } from "../header/items";

export interface CategoryPlacesProps {
  category: CategoryData & { places: PlaceItemData[] };
  session: Session | null;
  userData: PlaceItemProps['userData']
}

export default function CategoryPlaces({
  category,
  session,
  userData,
}: CategoryPlacesProps) {
  return (
    <section className="mt-6 flex flex-col space-y-5">
      {category.places && category.places.length > 0 &&
        category.places?.map((place) => {
          return <PlaceItem
            place={place}
            key={place.id}
            userData={userData}
            session={session}
          />;
        })}
    </section>
  );
}
