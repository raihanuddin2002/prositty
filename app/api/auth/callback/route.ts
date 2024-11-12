import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Error during code exchange:', error.message);
        return NextResponse.error(); // Ensure we return an error response
      }
      console.log("Session exchange successful");
    } catch (error) {
      console.error('Unexpected error during code exchange:', error);
      return NextResponse.error(); // Return a generic error response
    }
  } else {
    console.log("No code found in the query parameters");
  }

  // Redirect to account page
  return NextResponse.redirect(new URL("/account?login=true", req.url));
}
