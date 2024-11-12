"use client";

import { Database } from "@/types_db";
import Link from "next/link";
import React, { Fragment } from "react";
import { HiOutlineEmojiSad } from "react-icons/hi";
import { Card } from "../ui/card";

export interface CategoryListProps {
  categories: CategoryWithChildren[] | null;
}

export type CategoryData = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryWithChildren =
  | (CategoryData & { children: CategoryData[] })
  | null;

export default function CategoryList({ categories }: CategoryListProps) {
  return (
    <Fragment>
      {categories && categories?.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6">
          {categories?.map((category) => (
            <Card className="grid gap-6 relative group p-3" key={category?.id}>
              <div className="flex flex-col space-y-1">
                <Link
                  className="font-semibold"
                  href={`/category/${category?.slug}`}
                >
                  {category?.name}
                </Link>
                <ul className="pl-4">
                  {category?.children.map((subcategory) => (
                    <li key={subcategory.id}>
                      <Link href={`/category/${subcategory.slug}`}>
                        {subcategory.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 w-1/3 mx-auto mt-20">
          <HiOutlineEmojiSad className="h-14 w-14 text-zinc-600" />
          <h2 className="text-2xl font-semibold text-zinc-800">
            No categories found
          </h2>
          <p className="text-zinc-500 text-center">
            We couldn&apos;t find any categories yet. Please try again, and if
            you are an admin, create some!
          </p>
        </div>
      )}
    </Fragment>
  );
}
