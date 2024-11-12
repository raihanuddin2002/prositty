import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  console.log("Received request with code:", code);

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      console.log("Session exchange successful");
    } catch (error) {
      console.error('Error exchanging code for session:', error);
    }
  } else {
    console.log("No code found in the query parameters");
  }

  return NextResponse.redirect(new URL("/account?login=true", req.url));
}
