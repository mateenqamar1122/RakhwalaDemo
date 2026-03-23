-- ============================================================
-- Rakhwala — Supabase Schema
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qkxpxlovpadlauzxmvdu/sql
-- ============================================================

-- ── Properties ───────────────────────────────────────────────
create table if not exists public.properties (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  location     text not null,
  city         text not null,
  type         text not null,
  price        bigint not null,
  price_label  text not null,
  badge        text,
  beds         integer not null default 0,
  baths        integer not null default 0,
  sqft         text not null,
  sqft_num     integer not null,
  description  text not null default '',
  image_url    text not null default '',
  created_at   timestamptz not null default now()
);

alter table public.properties enable row level security;
create policy "Public read" on public.properties for select using (true);
create policy "Service insert" on public.properties for insert with check (true);

-- ── Property Inquiries ───────────────────────────────────────
create table if not exists public.property_inquiries (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  name        text not null,
  email       text not null,
  phone       text not null default '',
  message     text not null default '',
  created_at  timestamptz not null default now()
);

alter table public.property_inquiries enable row level security;
create policy "Public insert" on public.property_inquiries for insert with check (true);
create policy "Service read"  on public.property_inquiries for select using (true);

-- ── Valuations ───────────────────────────────────────────────
create table if not exists public.valuations (
  id               uuid primary key default gen_random_uuid(),
  property_type    text not null,
  city             text not null,
  area_sqft        integer not null,
  bedrooms         integer not null default 0,
  condition        text not null default 'Good',
  contact_name     text not null,
  contact_phone    text not null,
  estimated_value  bigint not null default 0,
  user_id          uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now()
);

alter table public.valuations enable row level security;
create policy "Public insert" on public.valuations for insert with check (true);
create policy "Service read"  on public.valuations for select using (true);

-- ── User Profiles ───────────────────────────────────────────────
create table if not exists public.user_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  phone        text,
  avatar_url   text,
  "current_role" text not null check ("current_role" in ('buyer', 'seller', 'admin')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── User Favorites (for buyers) ─────────────────────────────────
create table if not exists public.user_favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.user_profiles(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(user_id, property_id)
);

-- ── Consultation Requests ───────────────────────────────────────
create table if not exists public.consultation_requests (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       text not null,
  phone       text not null default '',
  interest    text not null,
  message     text not null default '',
  user_id     uuid references public.user_profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.consultation_requests enable row level security;
create policy "Users can manage own consultation requests" on public.consultation_requests for all using (auth.uid() = user_id);
create policy "Admins can view all consultation requests" on public.consultation_requests for select using (
  exists (select 1 from public.user_profiles where id = auth.uid() and "current_role" = 'admin')
);

-- ── User Properties (for sellers) ────────────────────────────────
create table if not exists public.user_properties (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.user_profiles(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(user_id, property_id)
);

-- ── Update properties table to include owner ─────────────────────
alter table public.properties add column if not exists owner_id uuid references public.user_profiles(id) on delete set null;

-- ── Update property_inquiries to include user ─────────────────────
alter table public.property_inquiries add column if not exists user_id uuid references public.user_profiles(id) on delete set null;

-- ── Helper Functions ─────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
    and "current_role" = 'admin'
  );
end;
$$;

-- RLS Policies for user_profiles
alter table public.user_profiles enable row level security;
create policy "Users can view own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.user_profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.user_profiles for insert with check (auth.uid() = id);
create policy "Admins can view all profiles" on public.user_profiles for select using (
  public.is_admin()
);

-- RLS Policies for user_favorites
alter table public.user_favorites enable row level security;
create policy "Users can manage own favorites" on public.user_favorites for all using (auth.uid() = user_id);

-- RLS Policies for user_properties
alter table public.user_properties enable row level security;
create policy "Users can manage own properties" on public.user_properties for all using (auth.uid() = user_id);
create policy "Admins can view all user properties" on public.user_properties for select using (
  public.is_admin()
);

-- Update properties RLS policies
create policy "Sellers can manage own properties" on public.properties for all using (auth.uid() = owner_id);
create policy "Admins can manage all properties" on public.properties for all using (
  public.is_admin()
);

-- Update property_inquiries RLS policies
create policy "Users can manage own inquiries" on public.property_inquiries for all using (auth.uid() = user_id);
create policy "Property owners can view inquiries" on public.property_inquiries for select using (
  exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
);
create policy "Admins can manage all inquiries" on public.property_inquiries for all using (
  public.is_admin()
);

-- Function to create user profile after signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name, "current_role")
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'buyer');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at on user_profiles
create trigger update_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

-- ── Seed: 12 properties ──────────────────────────────────────
insert into public.properties (title, location, city, type, price, price_label, badge, beds, baths, sqft, sqft_num, description, image_url) values
('Modern Villa',          'DHA Phase 5, Lahore',            'Lahore',     'Villa',      85000000,  'PKR 8.5 Cr',  'High Demand', 5, 6, '8,400 ft²',  8400,  'A stunning modern villa in the prestigious DHA Phase 5 community. Features open-plan living spaces, imported marble flooring, smart home system, rooftop terrace, and a private swimming pool.', ''),
('Luxury Apartment',      'Clifton Block 9, Karachi',       'Karachi',    'Apartment',  32000000,  'PKR 3.2 Cr',  null,          3, 3, '2,200 ft²',  2200,  'Elegantly designed apartment on the 12th floor of a premium high-rise in Clifton. Panoramic sea views, modular kitchen, central air conditioning, and dedicated parking.', ''),
('Margalla View House',   'F-7/2, Islamabad',               'Islamabad',  'House',      120000000, 'PKR 12.0 Cr', 'Premium',     6, 7, '9,100 ft²',  9100,  'An architectural masterpiece nestled against the Margalla Hills. Custom-designed interiors, a chef''s kitchen, home cinema, guest annexe, and serene gardens.', ''),
('Bahria Town Residence', 'Bahria Town Phase 8, Rawalpindi','Rawalpindi', 'House',      28000000,  'PKR 2.8 Cr',  null,          4, 4, '3,600 ft²',  3600,  'Well-maintained family home in Bahria Town''s gated community. Spacious rooms, modern kitchen, utility room, and a landscaped garden.', ''),
('Sea View Penthouse',    'DHA Phase 8, Karachi',           'Karachi',    'Penthouse',  65000000,  'PKR 6.5 Cr',  'New Listing', 4, 5, '4,800 ft²',  4800,  'Breath-taking top-floor penthouse with unobstructed Arabian Sea views. A private rooftop pool, floor-to-ceiling glass walls, smart lighting, and premium German appliances.', ''),
('Commercial Plaza',      'Blue Area, Islamabad',           'Islamabad',  'Commercial', 220000000, 'PKR 22.0 Cr', null,          0, 8, '12,000 ft²', 12000, 'Grade-A commercial plaza in Islamabad''s prime business district. 12,000 sq ft of flexible office space across multiple floors.', ''),
('Corner House',          'Gulberg III, Lahore',            'Lahore',     'House',      45000000,  'PKR 4.5 Cr',  'New Listing', 4, 4, '4,200 ft²',  4200,  'Bright corner plot house in the heart of Gulberg III offering extra light and street frontage. Recently renovated with Italian tiles and modular kitchen.', ''),
('Studio Apartment',      'Gulshan-e-Iqbal, Karachi',       'Karachi',    'Apartment',  9500000,   'PKR 0.95 Cr', null,          1, 1, '650 ft²',    650,   'Compact and stylish studio ideal for young professionals or as a rental investment. Open-plan layout, built-in storage, and modern bathroom.', ''),
('Farmhouse Estate',      'Bedian Road, Lahore',            'Lahore',     'Villa',      180000000, 'PKR 18.0 Cr', 'Premium',     7, 8, '15,000 ft²', 15000, 'An extraordinary private farmhouse estate spanning 4 kanals. Grand reception hall, 7 bedrooms, indoor pool, tennis court, and orchard.', ''),
('Office Complex',        'Sector G-8, Islamabad',          'Islamabad',  'Commercial', 95000000,  'PKR 9.5 Cr',  null,          0, 6, '8,000 ft²',  8000,  'Purpose-built office complex in Islamabad''s G-8 sector. Includes reception lobby, 6 executive suites, boardroom, and secure parking for 30 vehicles.', ''),
('Terrace Apartment',     'Bahria Heights, Rawalpindi',     'Rawalpindi', 'Apartment',  14000000,  'PKR 1.4 Cr',  'New Listing', 2, 2, '1,100 ft²',  1100,  'Freshly handed-over 2-bedroom apartment featuring a private terrace, fitted wardrobes, a modern kitchen, and communal swimming pool.', ''),
('Lake View Villa',       'DHA Phase 6, Lahore',            'Lahore',     'Villa',      155000000, 'PKR 15.5 Cr', 'High Demand', 6, 7, '11,200 ft²', 11200, 'A show-stopping villa overlooking DHA''s private lake. Grand double-height entrance, 6 opulent bedrooms, designer bathrooms, and boat jetty access.', '');
