"use client"; // Mark this as a client component

import React, { useState } from "react";
import { PlaceItemData } from "@/components/places/place-item";
import { CategoryData } from "@/components/places/user-places";
import { AdminData, UserData } from "@/components/header/items";
import { Session } from "@supabase/auth-helpers-nextjs";
import debounce from "lodash.debounce";
import { Checkbox } from "@/components/ui/checkbox";
import DatePicker from "react-datepicker";
import AllPlaces from "./all-places";

export interface AllPlacesFilterProps {
    places: PlaceItemData[] | null; // Allow users to be null
    session?: Session | null;
    categories?: CategoryData[]
    userData?: (UserData & { admin: AdminData | null }) | null
}

export default function AllPlacesFilter({
    places,
    session = null,
    categories,
    userData
}: AllPlacesFilterProps) {
    const [filters, setFilters] = useState({
        name: "",
        city: "",
        category_id: "",
        private: false
    });
    const [sort, setSort] = useState('')
    const [showFilter, setShowFilter] = useState(false); // State to toggle filter visibility
    const [startDate, setStartDate] = useState<Date | null>(null);

    const handleFilterChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    }, 500);

    return (
        <div>
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
                    className="py-2 px-4 bg-transparent focus:outline-none"
                    onChange={(e) => setSort(e.target.value)}
                >
                    <option value="">Sort</option>
                    <option value="NEWEST">Newest</option>
                    <option value="POPULAR">Most popular</option>
                </select>
            </div>

            {/* Filter Section (visible when showFilter is true) */}
            {showFilter && (
                <div className="mb-6 flex items-center flex-wrap gap-3 max-w-[100%]">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
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

                    <span className="border rounded-md pe-2">
                        <select
                            name="category"
                            className="py-2 px-2 bg-transparent focus:outline-none"
                            onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value }))}
                        >
                            <option value="">Category</option>
                            {
                                categories && categories?.length > 0 && categories.map((category) => (
                                    <option key={category?.id} value={category?.id}>{category.name}</option>
                                ))
                            }
                        </select>
                    </span>

                    <DatePicker
                        className="border px-2 py-2 rounded-md"
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat={"YYYY-MM-dd"}
                        isClearable={true}
                        showMonthDropdown
                        showYearDropdown
                        placeholderText="Select Date"
                    />

                    <span className="flex items-center gap-2">
                        <Checkbox
                            id="friends_recommenndations"
                            checked={filters.private}
                            onCheckedChange={() => setFilters((prev) => ({ ...prev, private: !prev.private }))}
                        />
                        <label htmlFor="friends_recommenndations" className="cursor-pointer active:text-primary">
                            Friends Recommendations
                        </label>
                    </span>
                </div>
            )}

            {/* User List Section */}
            <div className="grid grid-cols-1 gap-4 mt-4">
                <AllPlaces
                    places={places}
                    filters={filters}
                    sort={sort}
                    startDate={startDate}
                    session={session}
                    categories={categories}
                    userData={userData}
                />
            </div>
        </div >
    );
}
