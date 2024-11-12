import { addCategorySchema } from "@/components/category/add";
import { CategoryData } from "@/components/category/list";
import { AdminData, UserData } from "@/components/header/items";
import { addPlaceSchema } from "@/components/places/add";
import { PlaceItemData } from "@/components/places/place-item";
import { SearchResults } from "@/components/search/search-results";
import { Database } from "@/types_db";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import * as z from "zod";

export async function getParentCategories() {
  const supabase = createClientComponentClient<Database>();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null);

  return categories;
}

export async function addCategory(values: z.infer<typeof addCategorySchema>) {
  const supabase = createClientComponentClient<Database>();

  let slug = values.name.toLowerCase();

  slug = slug.replace(/\s+/g, "-");

  slug = slug.replace(/[^a-z0-9-]/g, "");

  const result = await supabase
    .from("categories")
    .insert([
      {
        name: values.name,
        parent_id: values.child ? values.parent || null : null,
        is_child: values.child,
        slug: slug,
      },
    ])
    .select();

  return result;
}

export async function addPlace(values: z.infer<typeof addPlaceSchema>) {
  const supabase = createClientComponentClient<Database>();

  const result = await supabase
    .from("places")
    .insert([
      {
        name: values.name,
        category_id: values.category,
        online: values.isOnline || false,
        city: values?.city || null,
        comment: values.comment,
        contact: values?.contact || null,
        link: values?.link || null,
        tags: values?.tags || null
      },
    ])
    .select();

  return result;
}

export async function editPlace(
  values: z.infer<typeof addPlaceSchema>,
  id: string
) {
  const supabase = createClientComponentClient<Database>();

  const result = await supabase
    .from("places")
    .update({
      name: values.name,
      category_id: values.category,
      online: values.isOnline,
      city: values?.city || null,
      comment: values.comment,
      contact: values?.contact || null,
      link: values?.link || null,
      tags: values?.tags || null
    })
    .eq("id", id);

  return result;
}

export async function editCategory(
  values: z.infer<typeof addCategorySchema>,
  id: string
) {
  const supabase = createClientComponentClient<Database>();

  const result = await supabase
    .from("categories")
    .update({
      name: values.name,
      is_child: values.child,
      parent_id: values.parent,
    })
    .eq("id", id);

  return result;
}

export async function getAllCategories() {
  const supabase = createClientComponentClient<Database>();

  const { data: categories } = await supabase.from("categories").select();

  return categories as CategoryData[];
}

export async function executeSearchByQuery(query: string) {
  const supabase = createClientComponentClient<Database>();
  const pattern = `%${query}%`;

  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select(
      ` 
        *,
        admin:admins(
          *
        )
        `
    )
    .ilike("username", pattern);

  if (usersError) console.log(usersError);

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select()
    .textSearch("name", `'${query}'`);

  if (categoriesError) console.log(categoriesError);

  const { data: places, error: placesError } = await supabase
    .from("places")
    .select(`id, name, created_at,created_by, comment, contact, link, online, city, tags, categories(id, name)`)
    .ilike("name", pattern);

  if (placesError) console.log(placesError);

  return {
    users: (users as SearchResults["users"]) || null,
    categories: categories || null,
    places: places as PlaceItemData[] || null,
  };
}

export async function addFavoriteUser(id: string) {
  const supabase = createClientComponentClient<Database>();

  const { error } = await supabase
    .from("favorite-users")
    .insert([{ user_id: id }])
    .select();

  if (error) console.log(error);

  return {
    error: error,
  };
}

export async function removeFavoriteUser(id: string) {
  const supabase = createClientComponentClient<Database>();

  const { error } = await supabase
    .from("favorite-users")
    .delete()
    .eq("user_id", id);

  if (error) console.log(error);

  return {
    error: error,
  };
}

export async function addFavoritePlace(id: string) {
  const supabase = createClientComponentClient<Database>();

  const { error } = await supabase
    .from("favorites")
    .insert([{ place_id: id }])
    .select();

  if (error) console.log(error);

  return {
    error: error,
  };
}

export async function removeFavoritePlace(id: string) {
  const supabase = createClientComponentClient<Database>();

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("place_id", id);

  if (error) console.log(error);

  return {
    error: error,
  };
}

export async function addLike(id: string) {
  const supabase = createClientComponentClient<Database>();

  const { error } = await supabase
    .from("liked")
    .insert([{ place_id: id }])
    .select();

  if (error) console.log(error);

  return {
    error: error,
  };
}

export async function removeLike(id: string) {
  const supabase = createClientComponentClient<Database>();

  const { error } = await supabase.from("liked").delete().eq("place_id", id);

  if (error) console.log(error);

  return {
    error: error,
  };
}

export async function getClosestUsers() {
  const supabase = createClientComponentClient<Database>();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return undefined;
  }

  const { data, error } = await supabase.rpc("get_user_locations", {
    user_id: session.user.id,
  });

  if (error) console.log("Geo error", error);

  return data as (UserData & { admin: AdminData | null })[] | null;
}
