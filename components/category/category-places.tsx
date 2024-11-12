"use client";

import React from "react";
import { CategoryData } from "./list";
import PlaceItemByCategory from "../places/place-item-category";
import { Session } from "@supabase/supabase-js";
import { PlaceItemData } from "../places/place-item";

export interface CategoryPlacesProps {
  category: CategoryData & { places: PlaceItemData[] | null };
  session: Session | null;
}

export default function CategoryPlaces({
  category,
  session,
}: CategoryPlacesProps) {
  return (
    <section className="mt-6 flex flex-col space-y-5">
      {category.places?.map((place) => {
        return <PlaceItemByCategory place={place} key={place.id} session={session} />;
      })}
    </section>
  );
}
