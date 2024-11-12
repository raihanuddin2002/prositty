"use client";

import React from "react";
import { Card } from "../ui/card";
import { Database } from "@/types_db";
import dayjs from "dayjs";
import { Button, buttonVariants } from "../ui/button";
import Link from "next/link";

export default function CategoryItem({
  category,
}: {
  category: Database["public"]["Tables"]["categories"]["Row"];
}) {
  return (
    <Card className="p-3 flex flex-row items-center justify-between">
      <div className="flex flex-row space-x-3 items-center">
        <h1 className="text-lg font-bold">{category?.name}</h1>
        <p className="text-gray-500">
          Created{" "}
          <span className="text-gray-600 font-bold">
            {dayjs(category?.created_at).format("MMMM YYYY")}
          </span>
        </p>
      </div>

      <Button asChild variant="ghost">
        <Link href={`/category/${category?.slug}`}>View category</Link>
      </Button>
    </Card>
  );
}
