import AccountForm from "@/components/account/account-form";
import { getSession, getUserDetails } from "../supabase-server";
import { redirect } from "next/navigation";

export default async function Account() {
  const [session, userData] = await Promise.all([
    getSession(),
    getUserDetails(),
  ]);

  if (!session) {
    return redirect("/login");
  }

  return <AccountForm session={session} userData={userData} />;
}
