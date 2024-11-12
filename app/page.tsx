import { Button } from "@/components/ui/button";
import { getSession } from "./supabase-server";
import { HiOutlineThumbUp } from "react-icons/hi";
import Link from "next/link";
import Dashboard from "@/components/home/dashboard";
import Homepage from "@/components/home/homepage";

export default async function Home({
  searchParams,
}: {
  searchParams: { ref: string };
}) {
  const [session] = await Promise.all([getSession()]);

  return (
    <div className="flex flex-col max-w-screen-xl mx-auto mt-2">
      {searchParams?.ref && (
        <div className="bg-primary/60 my-2 rounded-lg">
          <div className="max-w-screen-xl mx-auto px-4 py-3 items-center justify-between text-white sm:flex md:px-8">
            <div className="flex gap-x-4">
              <div className="w-10 h-10 flex-none rounded-lg bg-primary flex items-center justify-center">
                <HiOutlineThumbUp className="w-6 h-6" />
              </div>
              <p className="py-2 font-medium">
                <span className="font-bold">{searchParams.ref}</span> just
                invited you to use Prositty!
              </p>
            </div>

            <Button asChild variant="secondary">
              <Link href="/login">Register now</Link>
            </Button>
          </div>
        </div>
      )}
      {session ? <Dashboard session={session} /> : <Homepage />}
    </div>
  );
}
