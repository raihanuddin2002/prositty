import {
  getSession,
  getUserByUsername,
  getUserDetails,
  getUserPlacesByUsername,
} from "@/app/supabase-server";
import UserProfileView from "@/components/user/profile";
import { HiOutlineEmojiSad } from "react-icons/hi";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const [session, userData, places, myUser] = await Promise.all([
    getSession(),
    getUserByUsername(params.username),
    getUserPlacesByUsername(params.username),
    getUserDetails(),
  ]);

  if (!userData)
    return (
      <div className="flex flex-col items-center justify-center space-y-4 w-5/6 md:w-1/3 mx-auto mt-48">
        <HiOutlineEmojiSad className="h-20 w-20 text-zinc-600" />
        <h2 className="text-2xl font-semibold text-zinc-800">
          This user doesn&apos;t exist
        </h2>
        <p className="text-zinc-500 text-center">
          We couldn&apos;t find the user{" "}
          <span className="font-bold">{params.username}</span>. Please check if
          the username is correct and try again.
        </p>
      </div>
    );

  return (
    <UserProfileView
      userData={userData}
      session={session}
      places={places}
      isAdmin={myUser?.admin ? true : false}
    />
  );
}
