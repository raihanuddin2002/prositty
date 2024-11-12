"use client";

import React, { Fragment, useState } from "react";
import ProfileDropDown from "./profile-dropdown";
import { Session } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types_db";
import { Button } from "../ui/button";
import Link from "next/link";
import { HiMenuAlt3, HiOutlinePlus, HiOutlineSearch, HiOutlineX } from "react-icons/hi";
import { usePathname, useRouter } from "next/navigation";

export interface ItemsProps {
  session: Session | null;
  userData: (UserData & { admin: AdminData | null }) | null;
}

export type UserData = Database["public"]["Tables"]["profiles"]["Row"];
export type AdminData = Database["public"]["Tables"]["admins"]["Row"];

export default function Items({ userData, session }: ItemsProps) {
  const [menuState, setMenuState] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const router = useRouter();
  const pathname = usePathname();

  const navigation = [
    { title: "Users", path: "/users" },
    { title: "Categories", path: "/categories" },
    { title: "Recommendations", path: "/recommendations" },
    { title: "Favorites", path: "/favorites" },
  ];

  const Search = () => {
    router.push(`/search?q=${searchQuery}`);
  };

  return (
    <div className="flex-1 flex items-center justify-between">
      <div
        className={`bg-white absolute z-20 w-full top-16 left-0 p-4 md:px-8 border-b lg:static lg:block lg:border-none ${menuState ? "" : "hidden"
          }`}
      >
        {session && (
          <Fragment>
            <ul className="space-y-5 lg:flex lg:space-x-6 lg:space-y-0 lg:mt-0">
              {navigation.map((item, idx) => (
                <li key={idx} className="text-gray-600 hover:text-gray-900">
                  <Link href={item.path} onClick={() => setMenuState(false)}>
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-end justify-start gap-4 mt-5 pt-5 border-t lg:hidden">
              <ProfileDropDown
                userData={userData}
                session={session}
                setMenuState={setMenuState}
              />
              <div>
                <div className="text-base font-bold">{userData?.full_name}</div>
                <div className="text-zinc-500 dark:text-zinc-400">
                  {session?.user.email}
                </div>
              </div>
            </div>
          </Fragment>
        )}
      </div>
      <div className="flex-1 flex items-center justify-end space-x-2 sm:space-x-6">
        {session && (
          <Button asChild className="mt-2 md:mt-0">
            <Link href="/recommendations/add">
              <HiOutlinePlus className="w-4 h-4 mr-1" />
              Add
            </Link>
          </Button>
        )}

        {pathname != "/search" && session && (
          <form
            className="flex items-center space-x-2 border rounded-md p-2"
            onSubmit={(e) => {
              e.preventDefault();
              setMenuState(false);

              return Search();
            }}
          >
            <input
              className="w-full outline-none appearance-none placeholder-gray-500 text-gray-700 sm:w-auto"
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <HiOutlineSearch
              className="h-5 w-5 flex-none text-gray-400 cursor-pointer"
              onClick={() => {
                setMenuState(false);
                Search();
              }}
            />
          </form>
        )}
        {session ? (
          <ProfileDropDown
            wrapper="hidden lg:block"
            userData={userData}
            session={session}
            setMenuState={setMenuState}
          />
        ) : (
          <>
            <Button asChild variant="outline">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </>
        )}
        {session && (
          <button
            className="outline-none text-gray-400 block lg:hidden"
            onClick={() => setMenuState(!menuState)}
          >
            {menuState ? (
              <HiOutlineX className="w-6 h-6" />
            ) : (
              <HiMenuAlt3 className="w-6 h-6" />
            )}
          </button>
        )}
      </div>
    </div >
  );
}
