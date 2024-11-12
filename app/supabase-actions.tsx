"use server";

import { Database } from "@/types_db";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";

export const createActionsSupabaseClient = cache(() =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
);

export async function deleteUser(id: string) {
  const supabase = createActionsSupabaseClient();

  const { error } = await supabase.auth.admin.deleteUser(id);

  return error;
}
