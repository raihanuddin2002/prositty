"use client"; // Mark this as a client component

import React, { useState } from "react";
import UserItem from "@/components/user/user-item"; // Adjust the import path based on your project structure
import { calculateAge } from "@/utils";
import debounce from "lodash.debounce";

// Define the full User interface
interface User {
  id: string;
  address: string | null;
  avatar_url: string | null;
  belief: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
  dob: string | null;
  education: string | null;
  full_name: string | null;
  gender: "male" | "female" | "other" | null;
  hobbies: string | null;
  latitude: number | null;
  longitude: number | null;
  profession: string | null;
  race: string | null;
  short_description: string | null;
  updated_at: string | null;
  username: string;
  website: string | null;
  last_active: string; // Add last_active field
  last_signal: string | null; // Add last_signal field
  location: { coordinates: number[], type: "Point" } | null; // Add location field
  admin: AdminData | null;
}

interface AdminData {
  admin_from: string;
  user_id: string;
  valid: boolean;
  adminRole?: string;  // Optional or default field if needed
}

interface UserFilterProps {
  users: User[] | null; // Allow users to be null
}

export default function UserFilter({ users }: UserFilterProps) {
  const [filters, setFilters] = useState({
    city: "",
    country: "",
    race: "",
    location: "",
    age: "",
    gender: "",
    education: "",
    profession: ""
  });
  const [sort, setSort] = useState('')
  const [showFilter, setShowFilter] = useState(false); // State to toggle filter visibility

  const handleFilterChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  }, 500);

  const filteredUsers = (user: User) => {
    return (
      (!filters.city || user.city?.toLowerCase().startsWith(filters.city.toLowerCase())) &&
      (!filters.country || user.country?.toLowerCase().startsWith(filters.country.toLowerCase())) &&
      (!filters.race || user.race?.toLowerCase().startsWith(filters.race.toLowerCase())) &&
      (!filters.age || calculateAge(user?.dob ? user.dob : '').toString() === filters.age) &&
      (!filters.gender || user.gender?.toLowerCase() === filters.gender.toLowerCase()) &&
      (!filters.education || user.education?.toLowerCase().startsWith(filters.education.toLowerCase())) &&
      (!filters.profession || user.profession?.toLowerCase().startsWith(filters.profession.toLowerCase()))
    )
  };

  return (
    <div className="mt-3">
      {/* Toggle Filter Button */}
      <button
        onClick={() => setShowFilter((prev) => !prev)}
        className="text-blue-500 border border-blue-500 px-4 py-2 rounded-lg mb-4 me-3"
      >
        ☰ Filter
      </button>

      <div className="inline-block border rounded-md pe-2 ">
        <select
          name="sort"
          className="py-[10px] px-4 bg-transparent focus:outline-none"
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort</option>
          <option value="NEWEST">Newest</option>
        </select>
      </div>

      {/* Filter Section (visible when showFilter is true) */}
      {showFilter && (
        <div className="flex items-center gap-3 flex-wrap mb-6 max-w-full">
          <input
            type="text"
            name="country"
            placeholder="Country"
            onChange={handleFilterChange}
            className="border p-2 rounded-md"
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            onChange={handleFilterChange}
            className="border p-2 rounded-md"
          />

          <input
            type="text"
            name="race"
            placeholder="Race"
            onChange={handleFilterChange}
            className="border p-2 rounded-md"
          />

          <input
            type="text"
            name="age"
            placeholder="Age"
            onChange={handleFilterChange}
            className="border p-2 rounded-md"
          />

          <span className="border rounded-md pe-2">
            <select
              name="gender"
              className="py-2 px-4 rounded-md focus:outline-none"
              onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </span>

          <input
            type="text"
            name="education"
            placeholder="Education"
            onChange={handleFilterChange}
            className="border p-2 rounded-md"
          />
          <input
            type="text"
            name="profession"
            placeholder="Occupation"
            onChange={handleFilterChange}
            className="border p-2 rounded-md"
          />
        </div>
      )}

      {/* User List Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {users && users.length > 0 &&
          users
            .filter(user => filteredUsers(user))
            .sort((a, b) => {
              if (sort === "NEWEST") {
                const dateA = new Date(a.created_at).getTime()
                const dateB = new Date(b.created_at).getTime()

                return dateB - dateA;
              }
              return 0
            })
            .map((user) => (
              <UserItem userData={user} key={user.id} />
            ))}
      </div>
    </div>
  );
}
