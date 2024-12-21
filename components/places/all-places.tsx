"use client"

import React, { memo } from 'react'
import PlaceItem, { PlaceItemData } from '@/components/places/place-item'
import { AllPlacesFilterProps } from '@/components/places/all-places-filter'
import { HiOutlineEmojiSad } from 'react-icons/hi'
import { Virtuoso } from 'react-virtuoso'

type Props = {
  filters: any,
  sort: string,
  startDate: Date | null,
} & AllPlacesFilterProps

const AllPlaces = ({ places, filters, sort, startDate, session, categories, userData }: Props) => {
  const filteredPlaces = (place: PlaceItemData) => {
    return (
      (place?.id) &&
      (!filters.name || place.name?.toLowerCase().startsWith(filters.name.toLowerCase())) &&
      (!filters.city || place.city?.toLowerCase().startsWith(filters.city.toLowerCase())) &&
      (!filters.category_id || place?.category?.id?.toLowerCase() === filters.category_id.toLowerCase()) &&
      (!startDate || new Date(place.created_at).toDateString() === startDate.toDateString()) &&
      (filters.private ? place.private : true)
    )
  }

  const placesData = places && places.length > 0 ?
    places
      .filter(place => filteredPlaces(place))
      .sort((a, b) => {
        if (sort === "NEWEST") {
          const dateA = new Date(a.created_at).getTime()
          const dateB = new Date(b.created_at).getTime()

          return dateB - dateA;
        }
        if (sort === "POPULAR") {
          const favCountA = a.favorites;
          const favCountB = b.favorites;
          return favCountB - favCountA;
        }
        return 0
      }) : []

  return (
    <>
      {
        placesData && placesData.length > 0 ? (
          <Virtuoso
            useWindowScroll
            data={placesData}
            totalCount={placesData.length}
            overscan={3}
            itemContent={(_, place) => (
              <div key={place.id} className='py-2'>
                <PlaceItem
                  place={place}
                  session={session}
                  categories={categories}
                  userData={userData}
                />
              </div>
            )}
          />
        )
          : (
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
          )
      }
    </>
  )
}

export default memo(AllPlaces)
