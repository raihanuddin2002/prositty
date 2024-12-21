import { addCategorySchema } from "@/components/category/add";
import { CategoryData } from "@/components/category/list";
import { AdminData, UserData } from "@/components/header/items";
import { addPlaceSchema } from "@/components/places/add-place";
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
        private: values.private || false,
        online: values.isOnline || false,
        created_by: values?.created_by,
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
      private: values.private,
      online: values.isOnline,
      city: values?.city || null,
      comment: values.comment,
      contact: values?.contact || null,
      link: values?.link || null,
      tags: values?.tags || null
    })
    .eq("id", id)
    .select();

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
    .select(`id, name, created_at, created_by, comment, contact, link, online, city, tags, category:categories(id, name), profile:profiles(id, username,full_name, avatar_url)`)
    .ilike("name", pattern);

  if (placesError) console.log(placesError);

  return {
    users: (users as SearchResults["users"]) || null,
    categories: categories || null,
    places: (places as PlaceItemData[]) || null,
  };
}

export async function executeSearchByHashtag(hashtag: string) {
  const supabase = createClientComponentClient<Database>();

  const { data: places, error: placesError } = await supabase
    .from("places")
    .select(`id, name, created_at, comment, contact, link, online, city, tags, category:categories(id, name), profile:profiles(id, username,full_name, avatar_url)`)
    .contains("tags", [hashtag])

  if (placesError) console.log(placesError);

  return places as PlaceItemData[] | null
}

export async function addFavoriteUser(id: string, currentFavorites: number) {
  const supabase = createClientComponentClient<Database>();

  const favoriteUsersPromise = supabase
    .from("favorite-users")
    .insert([{ user_id: id }])
    .select();

  const updateProfilesPromise = supabase
    .from("profiles")
    .update({
      favorites: currentFavorites + 1
    })
    .eq("id", id)
    .select();

  const [{ error: favoriteUsersError }, { error: updateProfilesError }] = await Promise.all([favoriteUsersPromise, updateProfilesPromise])

  if (favoriteUsersError || updateProfilesError) {
    console.log(favoriteUsersError || updateProfilesError);
  } else if (favoriteUsersError) {
    console.log(favoriteUsersError);
    await supabase
      .from("profiles")
      .update({
        favorites: currentFavorites
      })
      .eq("id", id); // reversing the update
  } else if (updateProfilesError) {
    console.log(updateProfilesError);
    await supabase
      .from("favorite-users")
      .delete()
      .eq("user_id", id); // reversing the update
  }

  return {
    error: favoriteUsersError || updateProfilesError,
  };
}

export async function removeFavoriteUser(id: string, currentFavorites: number) {
  const supabase = createClientComponentClient<Database>();

  const favoriteUsersPromise = supabase
    .from("favorite-users")
    .delete()
    .eq("user_id", id);

  const updateProfilesPromise = supabase
    .from("profiles")
    .update({
      favorites: currentFavorites - 1
    })
    .eq("id", id);

  const [{ error: favoriteUsersError }, { error: updateProfilesError }] = await Promise.all([favoriteUsersPromise, updateProfilesPromise])

  if (favoriteUsersError || updateProfilesError) {
    console.log(favoriteUsersError || updateProfilesError);
  } else if (favoriteUsersError) {
    console.log(favoriteUsersError);
    await supabase
      .from("profiles")
      .update({
        favorites: currentFavorites
      })
      .eq("id", id); // reversing the update
  } else if (updateProfilesError) {
    console.log(updateProfilesError);
    await supabase
      .from("favorite-users")
      .insert([{ user_id: id }])
      .select(); // reversing the update
  }

  return {
    error: favoriteUsersError || updateProfilesError,
  };
}
// TODO: add favorite place
export async function addFavoritePlace(id: string, currentFavorites: number) {
  const supabase = createClientComponentClient<Database>();

  const insertFavoritePromise = supabase
    .from("favorites")
    .insert([{ place_id: id }])
    .select();

  const updatePlacesPromise = supabase
    .from("places")
    .update({
      favorites: currentFavorites + 1
    })
    .eq("id", id)
    .select();

  const [{ error: insertFavoriteError }, { error: updatePlacesError }] = await Promise.all([insertFavoritePromise, updatePlacesPromise])

  // if one of the errors, we need to reverse the update
  if (insertFavoriteError && updatePlacesError) {
    console.log('insertFavoriteError', insertFavoriteError);
    console.log('updatePlacesError', updatePlacesError);
  }
  else if (insertFavoriteError) {
    console.log(insertFavoriteError);
    await supabase
      .from("places")
      .update({
        favorites: currentFavorites
      })
      .eq("id", id); // reversing the update
  }
  else if (updatePlacesError) {
    console.log(updatePlacesError);
    await supabase
      .from("favorites")
      .delete()
      .eq("place_id", id); // reversing the update
  }

  return {
    error: insertFavoriteError || updatePlacesError,
  };
}

export async function removeFavoritePlace(id: string, currentFavorites: number) {
  const supabase = createClientComponentClient<Database>();

  const deleteFavoritePromise = supabase
    .from("favorites")
    .delete()
    .eq("place_id", id);

  const updatePlacesPromise = supabase
    .from("places")
    .update({
      favorites: currentFavorites - 1
    })
    .eq("id", id);

  const [{ error: deleteFavoriteError }, { error: updatePlacesError }] = await Promise.all([deleteFavoritePromise, updatePlacesPromise])

  // if one of the errors, we need to reverse the update
  if (deleteFavoriteError && updatePlacesError) {
    console.log('deleteFavoriteError', deleteFavoriteError);
    console.log('updatePlacesError', updatePlacesError);
  }
  else if (deleteFavoriteError) {
    console.log('deleteFavoriteError', deleteFavoriteError);
    await supabase
      .from("places")
      .update({
        favorites: currentFavorites
      })
      .eq("id", id); // reversing the update
  }
  else if (updatePlacesError) {
    console.log('updatePlacesError', updatePlacesError);

    await supabase
      .from("favorites")
      .insert([{ place_id: id }])
      .select(); // reversing the update
  }

  return {
    error: deleteFavoriteError || updatePlacesError,
  };
}

export async function addLike(id: string, currentLikes: number) {
  const supabase = createClientComponentClient<Database>();

  const likePromise = supabase
    .from("liked")
    .insert([{ place_id: id }])
    .select();

  const updatePlacesPromise = supabase
    .from("places")
    .update({
      likes: currentLikes + 1
    })
    .eq("id", id)
    .select();

  const [{ error: likeError }, { error: updatePlacesError }] = await Promise.all([likePromise, updatePlacesPromise])

  if (likeError && updatePlacesError) {
    console.log('likeError', likeError);
    console.log('updatePlacesError', updatePlacesError);
  }
  else if (likeError) {
    console.log('likeError', likeError);
    await supabase
      .from("places")
      .update({
        likes: currentLikes
      })
      .eq("id", id); // reversing the update
  } else if (updatePlacesError) {
    console.log('updatePlacesError', updatePlacesError);
    await supabase
      .from("liked")
      .delete()
      .eq("place_id", id); // reversing the update
  }

  return {
    error: likeError || updatePlacesError,
  };
}

export async function removeLike(id: string, currentLikes: number) {
  const supabase = createClientComponentClient<Database>();

  const likePromise = supabase.from("liked").delete().eq("place_id", id);

  const updatePlacesPromise = supabase
    .from("places")
    .update({
      likes: currentLikes - 1
    })
    .eq("id", id);

  const [{ error: likeError }, { error: updatePlacesError }] = await Promise.all([likePromise, updatePlacesPromise])

  if (likeError && updatePlacesError) {
    console.log('likeError', likeError);
    console.log('updatePlacesError', updatePlacesError);
  }
  else if (likeError) {
    console.log('likeError', likeError);
    await supabase
      .from("places")
      .update({
        likes: currentLikes
      })
      .eq("id", id); // reversing the update
  }

  return {
    error: likeError || updatePlacesError,
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
