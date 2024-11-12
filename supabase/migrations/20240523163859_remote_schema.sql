create type "public"."gender" as enum ('male', 'female', 'other');

create table "public"."admins" (
    "user_id" uuid not null,
    "admin_from" timestamp with time zone not null default now(),
    "valid" boolean not null default true
);


alter table "public"."admins" enable row level security;

create table "public"."categories" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "created_by" uuid not null default auth.uid(),
    "is_child" boolean not null default false,
    "parent_id" uuid,
    "name" text not null,
    "creator_id" uuid default auth.uid(),
    "slug" text not null
);


alter table "public"."categories" enable row level security;

create table "public"."favorite-users" (
    "id" uuid not null default gen_random_uuid(),
    "favorited_at" timestamp with time zone not null default now(),
    "owner_id" uuid not null default auth.uid(),
    "user_id" uuid not null
);


alter table "public"."favorite-users" enable row level security;

create table "public"."favorites" (
    "id" uuid not null default gen_random_uuid(),
    "favorited_at" timestamp with time zone not null default now(),
    "place_id" uuid not null,
    "owner_id" uuid not null default auth.uid()
);


alter table "public"."favorites" enable row level security;

create table "public"."liked" (
    "liked_at" timestamp with time zone not null default now(),
    "place_id" uuid,
    "owner_id" uuid not null default auth.uid(),
    "id" uuid not null default gen_random_uuid()
);


alter table "public"."liked" enable row level security;

create table "public"."places" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "comment" text not null,
    "contact" text,
    "link" text,
    "city" text,
    "category_id" uuid default '732ba6fa-6f52-4c07-bef7-d93bfae67afa'::uuid,
    "online" boolean default false,
    "created_by" uuid not null default auth.uid()
);


alter table "public"."places" enable row level security;

CREATE UNIQUE INDEX admins_pkey ON public.admins USING btree (user_id);

CREATE UNIQUE INDEX admins_user_id_key ON public.admins USING btree (user_id);

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);

CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);

CREATE UNIQUE INDEX "favorite-places_pkey" ON public.favorites USING btree (id);

CREATE UNIQUE INDEX "favorite-users_pkey" ON public."favorite-users" USING btree (id);

CREATE UNIQUE INDEX liked_pkey ON public.liked USING btree (id);

CREATE UNIQUE INDEX places_pkey ON public.places USING btree (id);

CREATE UNIQUE INDEX profiles_id_key ON public.profiles USING btree (id);

alter table "public"."admins" add constraint "admins_pkey" PRIMARY KEY using index "admins_pkey";

alter table "public"."categories" add constraint "categories_pkey" PRIMARY KEY using index "categories_pkey";

alter table "public"."favorite-users" add constraint "favorite-users_pkey" PRIMARY KEY using index "favorite-users_pkey";

alter table "public"."favorites" add constraint "favorite-places_pkey" PRIMARY KEY using index "favorite-places_pkey";

alter table "public"."liked" add constraint "liked_pkey" PRIMARY KEY using index "liked_pkey";

alter table "public"."places" add constraint "places_pkey" PRIMARY KEY using index "places_pkey";

alter table "public"."admins" add constraint "admins_user_id_key" UNIQUE using index "admins_user_id_key";

alter table "public"."categories" add constraint "categories_name_key" UNIQUE using index "categories_name_key";

alter table "public"."categories" add constraint "categories_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."categories" validate constraint "categories_parent_id_fkey";

alter table "public"."categories" add constraint "categories_slug_key" UNIQUE using index "categories_slug_key";

alter table "public"."favorites" add constraint "favorites_place_id_fkey" FOREIGN KEY (place_id) REFERENCES places(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."favorites" validate constraint "favorites_place_id_fkey";

alter table "public"."liked" add constraint "liked_place_id_fkey" FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE not valid;

alter table "public"."liked" validate constraint "liked_place_id_fkey";

alter table "public"."places" add constraint "places_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."places" validate constraint "places_category_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_key" UNIQUE using index "profiles_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_locations(user_id uuid)
 RETURNS SETOF profiles
 LANGUAGE plpgsql
AS $function$ BEGIN RETURN QUERY SELECT * FROM public.profiles WHERE id <> user_id AND location IS NOT NULL; END; $function$
;

CREATE OR REPLACE FUNCTION public.homepage_stats()
 RETURNS TABLE(places_count bigint, profiles_count bigint, last_login timestamp without time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  select count(*) from places into places_count;
  select count(*) from profiles into profiles_count;
  select max(last_signal) from profiles into last_login;
  return query select places_count, profiles_count, last_login;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_favorite_and_liked(place_id uuid)
 RETURNS TABLE(favorite boolean, liked boolean, likes integer)
 LANGUAGE sql
AS $function$select exists (
    select 1
    from favorites
    where place_id = is_favorite_and_liked.place_id
    and owner_id = auth.uid()
  ) as favorite,
  exists (
    select 1
    from liked
    where place_id = is_favorite_and_liked.place_id
    and owner_id = auth.uid()
  ) as liked,
  (select count(*)
    from liked
    where place_id = is_favorite_and_liked.place_id
  ) as likes;$function$
;

grant delete on table "public"."admins" to "anon";

grant insert on table "public"."admins" to "anon";

grant references on table "public"."admins" to "anon";

grant select on table "public"."admins" to "anon";

grant trigger on table "public"."admins" to "anon";

grant truncate on table "public"."admins" to "anon";

grant update on table "public"."admins" to "anon";

grant delete on table "public"."admins" to "authenticated";

grant insert on table "public"."admins" to "authenticated";

grant references on table "public"."admins" to "authenticated";

grant select on table "public"."admins" to "authenticated";

grant trigger on table "public"."admins" to "authenticated";

grant truncate on table "public"."admins" to "authenticated";

grant update on table "public"."admins" to "authenticated";

grant delete on table "public"."admins" to "service_role";

grant insert on table "public"."admins" to "service_role";

grant references on table "public"."admins" to "service_role";

grant select on table "public"."admins" to "service_role";

grant trigger on table "public"."admins" to "service_role";

grant truncate on table "public"."admins" to "service_role";

grant update on table "public"."admins" to "service_role";

grant delete on table "public"."categories" to "anon";

grant insert on table "public"."categories" to "anon";

grant references on table "public"."categories" to "anon";

grant select on table "public"."categories" to "anon";

grant trigger on table "public"."categories" to "anon";

grant truncate on table "public"."categories" to "anon";

grant update on table "public"."categories" to "anon";

grant delete on table "public"."categories" to "authenticated";

grant insert on table "public"."categories" to "authenticated";

grant references on table "public"."categories" to "authenticated";

grant select on table "public"."categories" to "authenticated";

grant trigger on table "public"."categories" to "authenticated";

grant truncate on table "public"."categories" to "authenticated";

grant update on table "public"."categories" to "authenticated";

grant delete on table "public"."categories" to "service_role";

grant insert on table "public"."categories" to "service_role";

grant references on table "public"."categories" to "service_role";

grant select on table "public"."categories" to "service_role";

grant trigger on table "public"."categories" to "service_role";

grant truncate on table "public"."categories" to "service_role";

grant update on table "public"."categories" to "service_role";

grant delete on table "public"."favorite-users" to "anon";

grant insert on table "public"."favorite-users" to "anon";

grant references on table "public"."favorite-users" to "anon";

grant select on table "public"."favorite-users" to "anon";

grant trigger on table "public"."favorite-users" to "anon";

grant truncate on table "public"."favorite-users" to "anon";

grant update on table "public"."favorite-users" to "anon";

grant delete on table "public"."favorite-users" to "authenticated";

grant insert on table "public"."favorite-users" to "authenticated";

grant references on table "public"."favorite-users" to "authenticated";

grant select on table "public"."favorite-users" to "authenticated";

grant trigger on table "public"."favorite-users" to "authenticated";

grant truncate on table "public"."favorite-users" to "authenticated";

grant update on table "public"."favorite-users" to "authenticated";

grant delete on table "public"."favorite-users" to "service_role";

grant insert on table "public"."favorite-users" to "service_role";

grant references on table "public"."favorite-users" to "service_role";

grant select on table "public"."favorite-users" to "service_role";

grant trigger on table "public"."favorite-users" to "service_role";

grant truncate on table "public"."favorite-users" to "service_role";

grant update on table "public"."favorite-users" to "service_role";

grant delete on table "public"."favorites" to "anon";

grant insert on table "public"."favorites" to "anon";

grant references on table "public"."favorites" to "anon";

grant select on table "public"."favorites" to "anon";

grant trigger on table "public"."favorites" to "anon";

grant truncate on table "public"."favorites" to "anon";

grant update on table "public"."favorites" to "anon";

grant delete on table "public"."favorites" to "authenticated";

grant insert on table "public"."favorites" to "authenticated";

grant references on table "public"."favorites" to "authenticated";

grant select on table "public"."favorites" to "authenticated";

grant trigger on table "public"."favorites" to "authenticated";

grant truncate on table "public"."favorites" to "authenticated";

grant update on table "public"."favorites" to "authenticated";

grant delete on table "public"."favorites" to "service_role";

grant insert on table "public"."favorites" to "service_role";

grant references on table "public"."favorites" to "service_role";

grant select on table "public"."favorites" to "service_role";

grant trigger on table "public"."favorites" to "service_role";

grant truncate on table "public"."favorites" to "service_role";

grant update on table "public"."favorites" to "service_role";

grant delete on table "public"."liked" to "anon";

grant insert on table "public"."liked" to "anon";

grant references on table "public"."liked" to "anon";

grant select on table "public"."liked" to "anon";

grant trigger on table "public"."liked" to "anon";

grant truncate on table "public"."liked" to "anon";

grant update on table "public"."liked" to "anon";

grant delete on table "public"."liked" to "authenticated";

grant insert on table "public"."liked" to "authenticated";

grant references on table "public"."liked" to "authenticated";

grant select on table "public"."liked" to "authenticated";

grant trigger on table "public"."liked" to "authenticated";

grant truncate on table "public"."liked" to "authenticated";

grant update on table "public"."liked" to "authenticated";

grant delete on table "public"."liked" to "service_role";

grant insert on table "public"."liked" to "service_role";

grant references on table "public"."liked" to "service_role";

grant select on table "public"."liked" to "service_role";

grant trigger on table "public"."liked" to "service_role";

grant truncate on table "public"."liked" to "service_role";

grant update on table "public"."liked" to "service_role";

grant delete on table "public"."places" to "anon";

grant insert on table "public"."places" to "anon";

grant references on table "public"."places" to "anon";

grant select on table "public"."places" to "anon";

grant trigger on table "public"."places" to "anon";

grant truncate on table "public"."places" to "anon";

grant update on table "public"."places" to "anon";

grant delete on table "public"."places" to "authenticated";

grant insert on table "public"."places" to "authenticated";

grant references on table "public"."places" to "authenticated";

grant select on table "public"."places" to "authenticated";

grant trigger on table "public"."places" to "authenticated";

grant truncate on table "public"."places" to "authenticated";

grant update on table "public"."places" to "authenticated";

grant delete on table "public"."places" to "service_role";

grant insert on table "public"."places" to "service_role";

grant references on table "public"."places" to "service_role";

grant select on table "public"."places" to "service_role";

grant trigger on table "public"."places" to "service_role";

grant truncate on table "public"."places" to "service_role";

grant update on table "public"."places" to "service_role";

create policy "Everybody can see admins"
on "public"."admins"
as permissive
for select
to authenticated
using (true);


create policy "Everyone has read access"
on "public"."categories"
as permissive
for select
to authenticated
using (true);


create policy "Only admins can add categories"
on "public"."categories"
as permissive
for insert
to authenticated
with check ((auth.uid() IN ( SELECT admins.user_id
   FROM admins
  WHERE (admins.valid = true))));


create policy "Only admins can delete categories"
on "public"."categories"
as permissive
for delete
to authenticated
using ((auth.uid() IN ( SELECT admins.user_id
   FROM admins
  WHERE (admins.valid = true))));


create policy "Only admins can edit categories"
on "public"."categories"
as permissive
for update
to authenticated
using ((auth.uid() IN ( SELECT admins.user_id
   FROM admins
  WHERE (admins.valid = true))));


create policy "Enable delete for users based on owner_id"
on "public"."favorite-users"
as permissive
for delete
to public
using ((auth.uid() = owner_id));


create policy "Enable insert for users based on user_id"
on "public"."favorite-users"
as permissive
for insert
to public
with check ((auth.uid() = owner_id));


create policy "Enable read access for users based on owner_id"
on "public"."favorite-users"
as permissive
for select
to authenticated
using ((auth.uid() = owner_id));


create policy "Enable delete for users based on owner_id"
on "public"."favorites"
as permissive
for delete
to public
using ((auth.uid() = owner_id));


create policy "Enable insert for users based on owner_id"
on "public"."favorites"
as permissive
for insert
to public
with check ((auth.uid() = owner_id));


create policy "Enable read for users based on owner_id"
on "public"."favorites"
as permissive
for select
to authenticated
using ((auth.uid() = owner_id));


create policy "Enable access based on owner_id and auth"
on "public"."liked"
as permissive
for all
to authenticated
using ((auth.uid() = owner_id))
with check ((auth.uid() = owner_id));


create policy "Enable creating a place which belongs to a user"
on "public"."places"
as permissive
for insert
to authenticated
with check ((auth.uid() = created_by));


create policy "Enable delete places for admins"
on "public"."places"
as permissive
for delete
to public
using ((auth.uid() IN ( SELECT admins.user_id
   FROM admins
  WHERE (admins.valid = true))));


create policy "Enable deleting places if they belong to user"
on "public"."places"
as permissive
for delete
to authenticated
using ((auth.uid() = created_by));


create policy "Enable update places for admins"
on "public"."places"
as permissive
for update
to public
using ((auth.uid() IN ( SELECT admins.user_id
   FROM admins
  WHERE (admins.valid = true))));


create policy "Enable updating a place that belongs to a user"
on "public"."places"
as permissive
for update
to authenticated
using ((auth.uid() = created_by))
with check ((auth.uid() = created_by));


create policy "Everyone can view places"
on "public"."places"
as permissive
for select
to authenticated
using (true);



