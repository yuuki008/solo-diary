-- Create public storage bucket `post-attachments` and policies for access control
-- This matches app logic in `lib/database.ts` which uses bucket `post-attachments`

begin;

insert into storage.buckets (id, name, public)
values ('post-attachments', 'post-attachments', true)
on conflict (id) do update set public = excluded.public;

-- Policies for storage.objects on bucket `post-attachments`
-- Clean up existing policies if re-running
drop policy if exists "Public can read attachments" on storage.objects;
drop policy if exists "Authenticated can upload attachments" on storage.objects;
drop policy if exists "Owner can update attachments" on storage.objects;
drop policy if exists "Owner can delete attachments" on storage.objects;

-- Public read (GET via Storage API / list via RPC)
create policy "Public can read attachments"
on storage.objects for select
using (
  bucket_id = 'post-attachments'
);

-- Authenticated users can upload to the bucket
create policy "Authenticated can upload attachments"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'post-attachments'
);

-- Only the owner can update their own objects
create policy "Owner can update attachments"
on storage.objects for update to authenticated
using (
  bucket_id = 'post-attachments' and owner = auth.uid()
)
with check (
  bucket_id = 'post-attachments' and owner = auth.uid()
);

-- Only the owner can delete their own objects
create policy "Owner can delete attachments"
on storage.objects for delete to authenticated
using (
  bucket_id = 'post-attachments' and owner = auth.uid()
);

commit;


