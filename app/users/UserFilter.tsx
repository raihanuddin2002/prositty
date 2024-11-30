"use client"; // Mark this as a client component

import React, { useState } from "react";
import UserItem from "@/components/user/user-item"; // Adjust the import path based on your project structure

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
    occupation: ""
  });

  const [showFilter, setShowFilter] = useState(false); // State to toggle filter visibility

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // console.log(users)
  const filteredUsers = users?.filter((user) => {
    return (
      (!filters.city || user.city?.toLowerCase() === filters.city.toLowerCase()) &&
      (!filters.country || user.country?.toLowerCase() === filters.country.toLowerCase()) &&
      (!filters.race || user.race?.toLowerCase() === filters.race.toLowerCase())
    );
  }) || [];

  return (
    <div>
      {/* Toggle Filter Button */}
      <button
        onClick={() => setShowFilter((prev) => !prev)}
        className="text-blue-500 border border-blue-500 px-4 py-2 rounded-lg mb-4"
      >
        ☰ Filter
      </button>

      {/* Filter Section (visible when showFilter is true) */}
      {showFilter && (
        <form className="mb-6 flex space-x-2 items-center" onSubmit={handleSubmit}>
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={filters.country}
            onChange={handleFilterChange}
            className="border p-2 rounded-md"
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={filters.city}
            onChange={handleFilterChange}
            className="border p-2 rounded-md"
          />

          <input
            type="text"
            name="race"
            placeholder="Race"
            value={filters.race}
            onChange={handleFilterChange}
            className="border p-2 rounded-md"
          />

          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg">
            Apply
          </button>
        </form>
      )}

      {/* User List Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {filteredUsers?.map((user) => (
          <UserItem userData={user} key={user.id} />
        ))}
      </div>
    </div>
  );
}
