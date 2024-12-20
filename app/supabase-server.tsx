import { CategoryData } from "@/components/category/list";
import { AdminData, ItemsProps, UserData } from "@/components/header/items";
import { UserPlacesListProps } from "@/components/places/user-places";
import { Database } from "@/types_db";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { cache } from "react";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { PlaceItemData } from "@/components/places/place-item";

export const createServerSupabaseClient = cache(() => {
  cookies().getAll()
  return createServerComponentClient<Database>({ cookies })
}
);
export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};


export async function getSession() {
  const supabase = createServerSupabaseClient();
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export async function getStats() {
  const supabase = createServerSupabaseClient();
  try {
    const { data } = await supabase.rpc("homepage_stats");
    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export async function getUserByUsername(username: string) {
  const supabase = createServerSupabaseClient();
  try {
    const { data: userDetails } = await supabase
      .from("profiles")
      .select(
        ` 
        *,
        admin:admins(
          *
        )
        `
      )
      .eq("username", username)
      .single();

    return userDetails as ItemsProps["userData"];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export async function getUserDetails() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const {
    data: { session },
  } = await supabase.auth.getSession();
  try {
    const { data: userDetails } = await supabase
      .from("profiles")
      .select(
        ` 
        *,
        admin:admins(
          *
        )
        `
      )
      .eq("id", session?.user?.id!)
      .single();

    return userDetails as ItemsProps["userData"];
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export async function getCategories() {
  const supabase = createServerSupabaseClient();
  try {
    const { data: categories } = await supabase
      .from("categories")
      .select("*, children:categories!parent_id (*)")
      .filter("parent_id", "is", "null");
    return categories;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export async function getAllCategories() {
  const supabase = createServerSupabaseClient();

  const { data: categories } = await supabase.from("categories").select();

  return categories as CategoryData[];
}

export async function getUserPlaces() {
  const supabase = createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { error, data: places } = await supabase
    .from("categories")
    .select(
      `
      *,
      places:places!inner (
        id, 
        name, 
        created_at,
        comment, 
        contact, 
        link, 
        online, 
        city, 
        tags, 
        likes, 
        favorites,
        private,
        category:categories(id, name),
        profile:profiles(id, username, full_name, avatar_url)
      )
      `
    )
    .eq("places.created_by", session?.user.id as string);

  return places as UserPlacesListProps["places"];
}

export async function getUserPlacesByUsername(username: string) {
  const supabase = createServerSupabaseClient();

  const userData = await getUserByUsername(username);

  const { error, data: places } = await supabase
    .from("categories")
    .select(
      `
        *,
          places:places!inner (
            id, 
            name, 
            created_at,
            comment, 
            contact, 
            link, 
            online, 
            city, 
            tags, 
            likes, 
            favorites,
            category:categories(id, name)
        )
      `
    )
    .eq("places.created_by", userData?.id as string);

  return places as UserPlacesListProps["places"];
}

export async function getAllPlacesByCategory() {
  const supabase = createServerSupabaseClient();

  const { data: places } = await supabase.from("categories").select(`
    *,
    places:places!inner (
      id, 
      name, 
      created_at,
      comment, 
      contact, 
      link, 
      online, 
      city, 
      tags, 
      likes, 
      favorites,
      category:categories(id, name), 
      profile:profiles(id, username, full_name, avatar_url)
    )
  `)
    .order("created_at", { ascending: false })
    .limit(10);

  return places as UserPlacesListProps["places"];

}

export async function GetUserDataById(id: string) {
  const supabase = createServerSupabaseClient();

  const { data: userDetails } = await supabase
    .from("profiles")
    .select(
      ` 
        *,
        admin:admins(
          *
        )
        `
    )
    .eq("id", id)
    .single();

  return userDetails as ItemsProps["userData"];
}

export async function getCategoryBySlug(slug: string) {
  const supabase = createServerSupabaseClient();

  const { error, data: category } = await supabase
    .from("categories")
    .select(
      `
        *,
        places:places!inner (
          id,
          name,
          created_at,
          comment,
          contact,
          link,
          online,
          city,
          tags,
          likes,
          favorites,
          category:categories(id, name),
          profile:profiles(id, username, full_name, avatar_url)
        )
      `
    )
    .eq("slug", slug)
    .single();

  return category as any["category"];
}

export async function getCategoryDetailsBySlug(slug: string) {
  const supabase = createServerSupabaseClient();

  const { error, data: category } = await supabase
    .from("categories")
    .select(`*`)
    .eq("slug", slug)
    .single();

  return category as CategoryData;
}
export async function getUserProducts(category_id: string, user_id: string) {
  const supabase = createServerSupabaseClient();

  const { error, data: products } = await supabase
    .from("places")
    .select(`
        id, 
        name, 
        created_at,
        created_by, 
        comment, contact, 
        link, 
        online, 
        city,
        tags, 
        likes,
        favorites,
        category:categories(id, name),
        profile:profiles(id, username,full_name, avatar_url)
      `)
    .eq("category_id", category_id)
    .eq('created_by', user_id)

  if (error) console.log(error)

  return products as PlaceItemData[] | null;
}

export async function getMostActiveUsers() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `  *,
        admin:admins(*
)
        `
    )
    .order("last_active", { ascending: false })
    .limit(6);

  if (error) console.log(error);

  return data as (UserData & { admin: AdminData | null })[] | null;
}

export async function getLatestPlaces(userCity: string) {
  const supabase = createServerSupabaseClient();

  const selectFileds = `
      id, 
      name, 
      created_at,
      comment, 
      contact, 
      link, 
      online, 
      city, 
      tags, 
      likes,
      favorites,
      private,
      category:categories(id, name),
      profile:profiles (id, username,full_name, avatar_url)
    `
  const placesFromUserCityPromise = supabase
    .from("places")
    .select(selectFileds)
    .eq("city", userCity)
    .order("created_at", { ascending: false })
    .limit(10)

  const placesFromOtherCitiesPromise = supabase
    .from("places")
    .select(selectFileds)
    .neq("city", userCity)
    .order("created_at", { ascending: false })
    .limit(10)

  const [
    { data: placesFromUserCity, error: errorUserCity },
    { data: placesFromOtherCities, error: errorOtherCities }
  ] = await Promise.all([placesFromUserCityPromise, placesFromOtherCitiesPromise])

  if (errorUserCity) console.log("errorUserCity", errorUserCity)
  if (errorOtherCities) console.log("errorOtherCities", errorOtherCities)

  let places = [] as PlaceItemData[]

  if (placesFromUserCity) places = [...placesFromUserCity] as PlaceItemData[]
  if (placesFromOtherCities) places = [...places, ...placesFromOtherCities] as PlaceItemData[]

  return places.length > 0 ? places : null
}

export async function getAllPlaces() {
  const supabase = createServerSupabaseClient();

  const { data: placesData, error: placesError } = await supabase
    .from("places")
    .select(`
      id, 
      name, 
      created_at,
      comment, 
      contact, 
      link, 
      online, 
      city, 
      tags, 
      likes,
      favorites,
      private,
      category:categories(id, name),
      profile:profiles (id, username,full_name, avatar_url)
    `)

  if (placesError) console.log(placesError)

  return placesData as PlaceItemData[] | null
}

export async function getAllUsers() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.from("profiles").select(
    ` 
        *,
        admin:admins(
          *
        )
        `
  );
  // console.log("Admin list all users", data)
  if (error) console.log(error);

  return data as (UserData & { admin: AdminData | null })[] | null;
}

export async function getAllFavorites() {
  const supabase = createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: placesData, error: placesError } = await supabase
    .from("favorites")
    .select(
      `
        place:places (
          id, 
          name, 
          created_at,
          comment, 
          contact, 
          link, 
          online, 
          city, 
          tags, 
          likes, 
          favorites,
          category:categories(id, name), 
          profile:profiles(id, username,full_name, avatar_url)
        )
      `
    )
    .eq("owner_id", session?.user.id as string);

  if (placesError) console.log(placesError);

  const { data: userData, error: userError } = await supabase
    .from("favorite-users")
    .select(
      `
    profile:profiles (
      *,
      admin:admins (
        *
      )
    )
  `
    )
    .eq("owner_id", session?.user.id as string);

  if (userError) console.log(userError);

  return {
    favoriteUsers: userData || null,
    favoritePlaces: placesData || null,
  };
}
