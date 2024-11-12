create extension if not exists "postgis" with schema "extensions";


drop policy "Public profiles are viewable by everyone." on "public"."profiles";

alter table "public"."profiles" drop constraint "profiles_id_fkey";

alter table "public"."profiles" add column "address" text;

alter table "public"."profiles" add column "belief" text;

alter table "public"."profiles" add column "city" text;

alter table "public"."profiles" add column "country" text;

alter table "public"."profiles" add column "created_at" timestamp with time zone not null default now();

alter table "public"."profiles" add column "dob" text;

alter table "public"."profiles" add column "education" text;

alter table "public"."profiles" add column "gender" gender;

alter table "public"."profiles" add column "hobbies" text;

alter table "public"."profiles" add column "last_active" timestamp with time zone not null default now();

alter table "public"."profiles" add column "last_signal" timestamp with time zone;

alter table "public"."profiles" add column "latitude" numeric;

alter table "public"."profiles" add column "location" geometry;

alter table "public"."profiles" add column "longitude" numeric;

alter table "public"."profiles" add column "profession" text;

alter table "public"."profiles" add column "race" text;

alter table "public"."profiles" add column "short_description" text;

alter table "public"."profiles" alter column "username" set not null;

CREATE INDEX profiles_geo_index ON public.profiles USING gist (location);

alter table "public"."admins" add constraint "admins_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."admins" validate constraint "admins_user_id_fkey";

alter table "public"."favorite-users" add constraint "favorite-users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."favorite-users" validate constraint "favorite-users_user_id_fkey";

create policy "Public profiles are viewable by everyone."
on "public"."profiles"
as permissive
for select
to authenticated
using (true);



