-- Create public storage bucket `images` and policies for access control
-- This matches app logic in `lib/database.ts` which uses bucket `images`

begin;

-- Create bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = excluded.public;

-- Policies for storage.objects on bucket `images`
-- Clean up existing policies if re-running
drop policy if exists "Public can read images" on storage.objects;
drop policy if exists "Authenticated can upload images" on storage.objects;
drop policy if exists "Owner can update images" on storage.objects;
drop policy if exists "Owner can delete images" on storage.objects;

-- Public read (GET via Storage API / list via RPC)
create policy "Public can read images"
on storage.objects for select
using (
  bucket_id = 'images'
);

-- Authenticated users can upload to the bucket
create policy "Authenticated can upload images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'images'
);

-- Only the owner can update their own objects
create policy "Owner can update images"
on storage.objects for update to authenticated
using (
  bucket_id = 'images' and owner = auth.uid()
)
with check (
  bucket_id = 'images' and owner = auth.uid()
);

-- Only the owner can delete their own objects
create policy "Owner can delete images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'images' and owner = auth.uid()
);

commit;


