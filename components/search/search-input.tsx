"use client";

import React, { useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";

export default function SearchInput() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const Search = async () => {
    await window.location.assign(`/search?q=${searchQuery}`);
  };


  return (
    <form
      className="flex items-center space-x-2 border rounded-md p-2"
      onSubmit={(e) => {
        e.preventDefault();

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
        onClick={() => Search()}
      />
    </form>
  );
}
