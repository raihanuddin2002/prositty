import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import { Database } from "./types_db";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && req.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/account", req.url));
  }
  if (user) {
    const { data: signalData } = await supabase
      .from("profiles")
      .select("last_signal, location")
      .eq("id", user.id)
      .single();
    // console.log(signalData)
    const lastSignalObject = new Date(signalData?.last_signal as string);
    const difference = new Date().getTime() - lastSignalObject.getTime();
    const timeFrame = 1000 * 60 * 2; //2 minutes in milliseconds

    if (difference >= timeFrame) {
      await supabase
        .from("profiles")
        .update({
          last_active: new Date(Date.now()).toISOString(),
          last_signal: new Date(Date.now()).toISOString(),
          // location: `POINT(${req.geo?.longitude} ${req.geo?.latitude})`,
          // city: req.geo.city,
          // country: req.geo.country,
        })
        .eq("id", user.id);
    }
    if(!signalData?.location){
      console.log("Registering location for new user..")
      if(req.geo?.longitude){
        console.log("Registering location for new user..", req.geo)
        await supabase
        .from("profiles")
        .update({
          location: `POINT(${req.geo?.longitude} ${req.geo?.latitude})`
        })
        .eq("id", user.id);
      }else{
        console.log("Reg.geo not available")
        await supabase
        .from("profiles")
        .update({
          location: `POINT(0 0)`
        })
        .eq("id", user.id);
      }
    }
  }

  return res;
}
