import React from "react";
import AuthForm from "@/components/auth/auth-form";
import { getSession } from "../supabase-server";
import { redirect } from "next/navigation";

export default async function Login() {
  const [session] = await Promise.all([getSession()]);

  if (session) {
    return redirect("/account");
  }

  return (
    <div>
      <AuthForm />
    </div>
  );
}
