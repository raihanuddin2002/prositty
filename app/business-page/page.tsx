import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import React from 'react'
import { HiOutlineEmojiSad } from 'react-icons/hi';
import { getSession, getCategoryDetailsBySlug, getUserProducts } from '../supabase-server';
import PlaceItem from '@/components/places/place-item';

export default async function BusinessPage() {
    const [session, categoryDetails] = await Promise.all([getSession(), getCategoryDetailsBySlug('products-')])
    const products = await Promise.resolve(getUserProducts(categoryDetails.id, session?.user?.id || ''))

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
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-5">
            <div className='flex gap-10'>
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


            <div className="max-w-screen-xl mx-auto">
                <div className="items-start justify-between py-4 border-b md:flex">
                    <div className="max-w-xl">
                        <h3 className="text-gray-800 text-2xl font-bold">
                            {categoryDetails.name}
                        </h3>
                        <p className="text-gray-600 mt-2">
                            <span className="text-black font-bold">
                                {products?.length}
                            </span>{" "}
                            products in total.
                        </p>
                    </div>

                </div>

                <section className="mt-6 flex flex-col space-y-5">
                    {products && products.length > 0 && products?.map((place) => {
                        return <PlaceItem place={place} key={place.id} session={session} />;
                    })}
                </section>
            </div>
        </div>
    )
}
