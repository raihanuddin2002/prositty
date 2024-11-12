import Link from "next/link";
import { HiOutlineCube, HiOutlineGlobe, HiOutlineUser } from "react-icons/hi";
import { Button } from "../ui/button";
import { useEffect } from 'react';
import { getStats } from "@/app/supabase-server";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import './homepage.css'
dayjs.extend(relativeTime);


export default async function Homepage() {
  const [stats] = await Promise.all([getStats()]);
  console.log(stats)
  return (
<main className="flex-1">
  <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
    <div id="mask" className="container px-4 md:px-6">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl mt-10 mb-4 font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Discover your Next Favorite Thing
          </h1>
          <span className="block h-1 mb-10 bg-[black] mx-auto line-grow-animation"></span>
          <p className="mx-auto mb-16 max-w-[700px] text-gray-500 md:text-2xl dark:text-gray-400">
            Prositty provides recommendations for movies, books, music, and
            restaurants tailored specifically to your needs.
          </p>
        </div>
        

        <Button asChild>
          <Link
            href="/login"
            className="relative group inline-block overflow-hidden px-12 py-6 text-sm sm:text-base md:text-lg font-semibold"
          >
            <span className="absolute inset-0 bg-[#7ed957] transform scale-y-0 origin-bottom transition-transform duration-300 ease-in-out group-hover:scale-y-100"></span>
            <span className="relative z-10 text-white group-hover:text-gray-100 transition-colors duration-300 ease-in-out">
              Get started
            </span>
          </Link>
        </Button>
      </div>
    </div>
  </section>
  <section
        className="w-full py-12 md:py-24 lg:py-32 " 
        style={{ backgroundColor: '#e7e6e6' }}
      >
        <div className="container px-4 md:px-6">
          <div className="grid items-center gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col justify-start space-y-4">
              <div className="space-y-2">
                <HiOutlineUser className="h-16 w-16 text-gray-900 dark:text-gray-50" />
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                  Latest and greatest
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-lg dark:text-gray-400">
                  Find the latest Recommendations that are created by people,
                  for people!
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-start space-y-4">
              <div className="space-y-2">
                <HiOutlineGlobe className="h-16 w-16 text-gray-900 dark:text-gray-50" />
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                  Locate it!
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-lg dark:text-gray-400">
                  Locate Reccommendations that are more relevant to you using
                  your location.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-start space-y-4">
              <div className="space-y-2">
                <HiOutlineCube className="h-16 w-16 text-gray-900 dark:text-gray-50" />
                <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                  Easy-to-use interface
                </h2>
                <p className="max-w-[600px] text-gray-500 md:text-lg dark:text-gray-400">
                  Navigate through our platform with ease using our intuitive
                  design.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative w-full py-16 md:py-24 lg:py-32 text-center text-gray-900">
  {/* Background Image */}
  <div
    style={{
      backgroundImage: "url('bg1.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.3,
      zIndex: 0,
    }}
  ></div>
  
  {/* Content Overlay */}
  <div className="relative container grid items-center justify-center gap-8 px-6 z-10">
    <div className="space-y-4 mb-12">
      {/* Styled Heading with Underline */}
      <h2 className="text-7xl font-bold tracking-tighter relative inline-block">
        Our Impact
      </h2>
      
      <p className="mx-auto mt-4 max-w-[700px] text-gray-600 md:text-xl lg:text-lg dark:text-gray-400">
        See the statistics and how Prositty is trying to make a change.
      </p>
    </div>

    {/* Stats Section */}
    <div className="grid w-full grid-cols-1 lg:grid-cols-2 items-center justify-center gap-12">
      {/* Recommendations Stat */}
      <div className="flex flex-col items-center space-y-2 hover:scale-105 transition-transform duration-300 ease-in-out">
        <h3 className="text-4xl md:text-5xl font-extrabold text-[#7ed957] relative">
          {stats ? stats![0].places_count : "0"}
          <span className="block w-2/3 h-1 bg-[#7ed957] mt-2 mx-auto"></span>
        </h3>
        <p className="text-gray-600 md:text-lg">Recommendations</p>
      </div>

      {/* Last Interaction Stat */}
      <div className="flex flex-col items-center space-y-2 hover:scale-105 transition-transform duration-300 ease-in-out">
        <h3 className="text-4xl md:text-5xl font-extrabold text-[#7ed957] relative">
          {stats ? dayjs().to(dayjs(stats![0].last_login)) : 0}
          <span className="block w-2/3 h-1 bg-[#7ed957] mt-2 mx-auto"></span>
        </h3>
        <p className="text-gray-600 md:text-lg">Last Interaction</p>
      </div>
    </div>
  </div>
</section>
    </main>
  );
}
