import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import React from 'react'
import { HiOutlineEmojiSad } from 'react-icons/hi';
import { getSession, getCategoryDetailsBySlug, getUserProducts, getCategories, getUserDetails } from '../supabase-server';
import PlaceItem from '@/components/places/place-item';

export default async function BusinessPage() {
    const [categoriesData, userData, session] = await Promise.all([getCategories(), getUserDetails(), getSession()])
    const products = await Promise.resolve(getUserProducts(userData?.id || ''))

    if (!products)
        return (
            <div className="flex flex-col items-center justify-center space-y-4 w-5/6 md:w-1/3 mx-auto mt-48">
                <HiOutlineEmojiSad className="h-20 w-20 text-zinc-600" />
                <h2 className="text-2xl font-semibold text-zinc-800">
                    This category is empty or doesn&apos;t exist
                </h2>
                <p className="text-zinc-500 text-center">
                    We couldn&apos;t find any Reccomendations in the category{" "}
                    <span className="font-bold">products-</span>. Add a reccomendation
                    or check if the url is correct.
                </p>
            </div>
        );

    return (
        <section className="w-full lg:max-w-6xl mx-auto flex flex-col md:grid md:grid-cols-3">
            <div className="p-5 py-10 col-span-1">
                <div className=''>
                    <Avatar className="h-40 w-40 mb-5">
                        <AvatarImage
                            alt={"Your user image"}
                        // src={avatarUrl || undefined}
                        />
                        <AvatarFallback>
                            {/* {initials} */}
                        </AvatarFallback>
                    </Avatar>

                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore pariatur accusamus porro eum? Illum earum, amet similique libero veritatis minus suscipit? Atque deserunt laborum blanditiis libero, debitis pariatur soluta repellendus? Placeat eum, consequatur reprehenderit doloribus sapiente omnis, ea recusandae nihil laboriosam asperiores quos debitis, rerum eius unde ab cumque. Autem ipsa nesciunt debitis sit.
                    </p>
                </div>
            </div>

            <div className="p-5 col-span-2">
                <div className="items-start justify-between py-4 border-b md:flex">
                    <p className="text-gray-600 mt-2">
                        <span className="text-black font-bold">
                            {products?.length}
                        </span>{" "}
                        products in total.
                    </p>
                </div>

                <section className="mt-6 flex flex-col gap-4  mx-auto">
                    {products && products.length > 0 && products?.map((place) => {
                        return <PlaceItem
                            place={place}
                            key={place.id}
                            userData={userData}
                            session={session}
                            categories={categoriesData}
                        />;
                    })}
                </section>
            </div>
        </section>
    )
}
