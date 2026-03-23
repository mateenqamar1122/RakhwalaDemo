-- ============================================================
-- Database Schema Updates for New Pages
-- Run this in Supabase SQL Editor after the main schema
-- ============================================================

-- ── Update user_profiles table with additional fields ─────────────
alter table public.user_profiles 
add column if not exists bio text,
add column if not exists location text,
add column if not exists website text,
add column if not exists phone_verified boolean default false,
add column if not exists email_verified boolean default false,
add column if not exists last_login timestamptz,
add column if not exists profile_views integer default 0;

-- ── Property status and additional fields ─────────────────────────
alter table public.properties 
add column if not exists status text not null default 'active' check (status in ('active', 'pending', 'sold', 'rented', 'inactive')),
add column if not exists views integer default 0,
add column if not exists inquiries_count integer default 0,
add column if not exists featured boolean default false,
add column if not exists contact_name text,
add column if not exists contact_phone text,
add column if not exists contact_email text,
add column if not exists approved_at timestamptz,
add column if not expires_at timestamptz;

-- ── Property images table ───────────────────────────────────────
create table if not exists public.property_images (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  image_url   text not null,
  is_primary  boolean default false,
  sort_order  integer default 0,
  created_at  timestamptz not null default now()
);

alter table public.property_images enable row level security;
create policy "Users can view property images" on public.property_images for select using (true);
create policy "Property owners can manage images" on public.property_images for all using (
  exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
);
create policy "Admins can manage all images" on public.property_images for all using (public.is_admin());

-- ── User settings table ───────────────────────────────────────────
create table if not exists public.user_settings (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references public.user_profiles(id) on delete cascade,
  email_notifications  boolean default true,
  push_notifications  boolean default false,
  property_alerts     boolean default true,
  inquiry_notifications boolean default true,
  marketing_emails    boolean default false,
  newsletter          boolean default true,
  profile_visibility  text default 'public' check (profile_visibility in ('public', 'private', 'friends')),
  show_email          boolean default false,
  show_phone          boolean default true,
  allow_messages      boolean default true,
  show_activity       boolean default true,
  theme               text default 'light' check (theme in ('light', 'dark', 'system')),
  language            text default 'en',
  currency            text default 'PKR',
  date_format         text default 'dd/mm/yyyy',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(user_id)
);

alter table public.user_settings enable row level security;
create policy "Users can manage own settings" on public.user_settings for all using (auth.uid() = user_id);

-- ── User activity log ─────────────────────────────────────────────
create table if not exists public.user_activity (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.user_profiles(id) on delete cascade,
  activity_type text not null check (activity_type in ('view', 'favorite', 'inquiry', 'login', 'profile_update', 'property_create', 'property_update')),
  property_id uuid references public.properties(id) on delete set null,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

alter table public.user_activity enable row level security;
create policy "Users can view own activity" on public.user_activity for select using (auth.uid() = user_id);
create policy "Users can create own activity" on public.user_activity for insert with check (auth.uid() = user_id);
create policy "Admins can view all activity" on public.user_activity for select using (public.is_admin());

-- ── Property views tracking ───────────────────────────────────────
create table if not exists public.property_views (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  user_id     uuid references public.user_profiles(id) on delete set null,
  ip_address  inet,
  user_agent  text,
  viewed_at   timestamptz not null default now()
);

alter table public.property_views enable row level security;
create policy "Public can insert property views" on public.property_views for insert with check (true);
create policy "Property owners can view own property views" on public.property_views for select using (
  exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
);
create policy "Admins can view all property views" on public.property_views for select using (public.is_admin());

-- ── Update properties table to handle multiple images ─────────────
-- Create a function to get primary image for a property
create or replace function public.get_property_primary_image(property_uuid uuid)
returns text
language plpgsql
security definer
as $$
declare
  primary_image_url text;
begin
  select image_url into primary_image_url
  from public.property_images
  where property_id = property_uuid and is_primary = true
  limit 1;
  
  if primary_image_url is null then
    select image_url into primary_image_url
    from public.property_images
    where property_id = property_uuid
    order by sort_order, created_at
    limit 1;
  end if;
  
  return primary_image_url;
end;
$$;

-- ── Function to log property view ───────────────────────────────────
create or replace function public.log_property_view(property_uuid uuid, user_ip inet, user_agent_text text)
returns void
language plpgsql
security definer
as $$
begin
  -- Increment property views count
  update public.properties 
  set views = views + 1 
  where id = property_uuid;
  
  -- Log the view
  insert into public.property_views (property_id, user_id, ip_address, user_agent)
  values (property_uuid, auth.uid(), user_ip, user_agent_text);
  
  -- Log user activity if authenticated
  if auth.uid() is not null then
    insert into public.user_activity (user_id, activity_type, property_id)
    values (auth.uid(), 'view', property_uuid);
  end if;
end;
$$;

-- ── Function to get user statistics ───────────────────────────────────
create or replace function public.get_user_stats(user_uuid uuid)
returns json
language plpgsql
security definer
as $$
declare
  result json;
  total_properties integer;
  active_properties integer;
  pending_properties integer;
  total_views bigint;
  total_inquiries bigint;
  total_favorites integer;
begin
  select count(*) into total_properties
  from public.properties
  where owner_id = user_uuid;
  
  select count(*) into active_properties
  from public.properties
  where owner_id = user_uuid and status = 'active';
  
  select count(*) into pending_properties
  from public.properties
  where owner_id = user_uuid and status = 'pending';
  
  select coalesce(sum(views), 0) into total_views
  from public.properties
  where owner_id = user_uuid;
  
  select coalesce(sum(inquiries_count), 0) into total_inquiries
  from public.properties
  where owner_id = user_uuid;
  
  select count(*) into total_favorites
  from public.user_favorites
  where user_id = user_uuid;
  
  result := json_build_object(
    'total_properties', total_properties,
    'active_properties', active_properties,
    'pending_properties', pending_properties,
    'total_views', total_views,
    'total_inquiries', total_inquiries,
    'total_favorites', total_favorites
  );
  
  return result;
end;
$$;

-- ── Function to create property with images ─────────────────────────
create or replace function public.create_property_with_images(
  property_title text,
  property_location text,
  property_city text,
  property_type text,
  property_price bigint,
  property_price_label text,
  property_badge text,
  property_beds integer,
  property_baths integer,
  property_sqft text,
  property_sqft_num integer,
  property_description text,
  contact_name_text text,
  contact_phone_text text,
  contact_email_text text,
  image_urls text[],
  property_status text default 'pending'
)
returns uuid
language plpgsql
security definer
as $$
declare
  property_uuid uuid;
  image_url text;
  image_index integer;
begin
  -- Create the property
  insert into public.properties (
    title, location, city, type, price, price_label, badge, 
    beds, baths, sqft, sqft_num, description, status,
    owner_id, contact_name, contact_phone, contact_email
  )
  values (
    property_title, property_location, property_city, property_type, 
    property_price, property_price_label, property_badge,
    property_beds, property_baths, property_sqft, property_sqft_num, 
    property_description, property_status,
    auth.uid(), contact_name_text, contact_phone_text, contact_email_text
  )
  returning id into property_uuid;
  
  -- Add images if provided
  image_index := 0;
  foreach image_url in array image_urls
  loop
    insert into public.property_images (property_id, image_url, is_primary, sort_order)
    values (property_uuid, image_url, image_index = 0, image_index);
    image_index := image_index + 1;
  end loop;
  
  -- Log user activity
  insert into public.user_activity (user_id, activity_type, property_id, metadata)
  values (auth.uid(), 'property_create', property_uuid, json_build_object('title', property_title));
  
  return property_uuid;
end;
$$;

-- ── Update user_profiles trigger for settings ───────────────────────
create or replace function public.create_user_settings()
returns trigger as $$
begin
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create settings when profile is created
drop trigger if exists create_user_settings_trigger on public.user_profiles;
create trigger create_user_settings_trigger
  after insert on public.user_profiles
  for each row execute procedure public.create_user_settings();

-- ── Update settings updated_at trigger ─────────────────────────────────
create trigger update_user_settings_updated_at
  before update on public.user_settings
  for each row execute procedure public.handle_updated_at();

-- ── Indexes for better performance ───────────────────────────────────
create index if not exists idx_properties_owner_id on public.properties(owner_id);
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_city on public.properties(city);
create index if not exists idx_properties_type on public.properties(type);
create index if not exists idx_properties_price on public.properties(price);
create index if not exists idx_property_images_property_id on public.property_images(property_id);
create index if not exists idx_user_favorites_user_id on public.user_favorites(user_id);
create index if not exists idx_user_favorites_property_id on public.user_favorites(property_id);
create index if not exists idx_user_activity_user_id on public.user_activity(user_id);
create index if not exists idx_user_activity_created_at on public.user_activity(created_at);
create index if not exists idx_property_views_property_id on public.property_views(property_id);
create index if not exists idx_property_views_viewed_at on public.property_views(viewed_at);

-- ── Grant necessary permissions ───────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant all on public.property_images to authenticated;
grant all on public.user_settings to authenticated;
grant all on public.user_activity to authenticated;
grant all on public.property_views to authenticated;
grant execute on function public.get_property_primary_image to anon, authenticated;
grant execute on function public.log_property_view to anon, authenticated;
grant execute on function public.get_user_stats to authenticated;
grant execute on function public.create_property_with_images to authenticated;
