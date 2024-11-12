import Link from "next/link";
import Items from "./items";
import { getUserDetails, getSession } from "@/app/supabase-server";

export default async function Header() {
  const [session, userData] = await Promise.all([
    getSession(),
    getUserDetails(),
  ]);

  return (
    <nav className="bg-white border-b sticky top-0 z-[1000]">
      <div className="flex items-center space-x-8 py-3 px-4 max-w-screen-xl mx-auto md:px-8">
        <div className="flex-none lg:flex-initial">
          <Link href="/">
            <h1 className="text-lg font-bold">Prositty</h1>
          </Link>
        </div>
        <Items userData={userData} session={session} />
      </div>
    </nav>
  );
}
