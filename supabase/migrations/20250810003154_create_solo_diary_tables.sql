-- supabase/migrations/20250810003154_create_solo_diary_tables.sql

-- users テーブル（auth.usersを拡張）
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  profile_image_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- バリデーション制約
  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 30),
  constraint username_format check (username ~ '^[a-zA-Z0-9_-]+$')
);

-- posts テーブル
create table if not exists public.posts (
  id bigserial primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint content_not_empty check (char_length(trim(content)) > 0),
  constraint content_max_length check (char_length(content) <= 10000)
);

-- images テーブル
create table if not exists public.images (
  id bigserial primary key,
  post_id bigint references public.posts(id) on delete cascade not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint url_not_empty check (char_length(trim(url)) > 0)
);

-- インデックスの作成
create index if not exists users_username_idx on public.users(username);
create index if not exists posts_user_id_idx on public.posts(user_id);
create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists posts_user_created_idx on public.posts(user_id, created_at desc);
create index if not exists images_post_id_idx on public.images(post_id);

-- RLS (Row Level Security) の有効化
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.images enable row level security;

-- users テーブルのRLSポリシー
create policy "Users can view their own profile" 
  on public.users for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.users for update 
  using (auth.uid() = id);

-- posts テーブルのRLSポリシー
create policy "Users can view their own posts" 
  on public.posts for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own posts" 
  on public.posts for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own posts" 
  on public.posts for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own posts" 
  on public.posts for delete 
  using (auth.uid() = user_id);

-- images テーブルのRLSポリシー
create policy "Users can view images of their own posts" 
  on public.images for select 
  using (
    exists (
      select 1 from public.posts 
      where posts.id = images.post_id 
      and posts.user_id = auth.uid()
    )
  );

create policy "Users can insert images to their own posts" 
  on public.images for insert 
  with check (
    exists (
      select 1 from public.posts 
      where posts.id = images.post_id 
      and posts.user_id = auth.uid()
    )
  );

create policy "Users can delete images from their own posts" 
  on public.images for delete 
  using (
    exists (
      select 1 from public.posts 
      where posts.id = images.post_id 
      and posts.user_id = auth.uid()
    )
  );

-- updated_at の自動更新用関数
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- updated_at の自動更新トリガー
create trigger handle_users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger handle_posts_updated_at
  before update on public.posts
  for each row execute procedure public.handle_updated_at();

-- 新規ユーザー登録時にusersテーブルにレコードを作成する関数
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_username text;
begin
  -- メタデータからusernameを取得（なければemailのローカル部分を使用）
  user_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );
  
  -- usernameの重複チェック・調整
  while exists(select 1 from public.users where username = user_username) loop
    user_username := user_username || '_' || floor(random() * 1000)::text;
  end loop;
  
  insert into public.users (id, username)
  values (new.id, user_username);
  
  return new;
end;
$$ language plpgsql security definer;

-- 新規ユーザー登録時のトリガー
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ユーザー削除時の関数
create or replace function public.handle_user_delete()
returns trigger as $$
begin
  delete from public.users where id = old.id;
  return old;
end;
$$ language plpgsql security definer;

-- ユーザー削除時のトリガー
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute procedure public.handle_user_delete();