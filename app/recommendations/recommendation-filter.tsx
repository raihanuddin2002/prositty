"use client"; // Mark this as a client component

import React, { useState } from "react";
import PlaceItem, { PlaceItemData } from "@/components/places/place-item";
import { CategoryData } from "@/components/places/user-places";
import { AdminData, UserData } from "@/components/header/items";
import { Session } from "@supabase/auth-helpers-nextjs";
import debounce from "lodash.debounce";
import { HiOutlineEmojiSad } from "react-icons/hi";
import { Checkbox } from "@/components/ui/checkbox";
import DatePicker from "react-datepicker";

interface Props {
    places: PlaceItemData[] | null; // Allow users to be null
    session?: Session | null;
    categories?: CategoryData[]
    userData?: (UserData & { admin: AdminData | null }) | null
}

export default function RecommendationFilter({
    places,
    session = null,
    categories,
    userData
}: Props) {
    const [filters, setFilters] = useState({
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

    const filteredPlaces = (place: PlaceItemData) => {
        return (
            (place?.id) &&
            (!filters.city || place.city?.toLowerCase().startsWith(filters.city.toLowerCase())) &&
            (!filters.category_id || place.category_id?.toLowerCase() === filters.category_id.toLowerCase()) &&
            (!startDate || new Date(place.created_at).toDateString() === startDate.toDateString()) &&
            (filters.private ? place.private : true)
        )
    }

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
                </select>
            </div>

            {/* Filter Section (visible when showFilter is true) */}
            {showFilter && (
                <div className="mb-6 flex items-center flex-wrap gap-3 max-w-[100%]">
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
                {places && places?.length > 0 ? (
                    places
                        .filter(place => filteredPlaces(place))
                        .sort((a, b) => {
                            if (sort === "NEWEST") {
                                const dateA = new Date(a.created_at).getTime()
                                const dateB = new Date(b.created_at).getTime()

                                return dateB - dateA;
                            }
                            return 0
                        })
                        .map((place) => (
                            <PlaceItem
                                key={place.id}
                                place={place}
                                session={session}
                                categories={categories}
                                userData={userData}
                            />
                        ))
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-4 w-1/3 mx-auto mt-20">
                        <HiOutlineEmojiSad className="h-14 w-14 text-zinc-600" />
                        <h2 className="text-2xl font-semibold text-zinc-800">
                            No Recommendations found
                        </h2>
                        <p className="text-zinc-500 text-center">
                            We couldn&apos;t find any Recommendations submitted by users yet.
                            Please try again, and if you haven&apos;t created a Recommendation,
                            create one!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
