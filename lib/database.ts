import { supabase } from "./supabase/client";
import { PostUpdate, PostWithImages, CreatePostData } from "@/types/database";

// 投稿関連
export const getUserPosts = async (userId: string, limit?: number) => {
  let query = supabase
    .from("posts")
    .select(
      `
      *,
      images (*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as PostWithImages[];
};

export const getPost = async (postId: number) => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      images (*),
      users (*)
    `
    )
    .eq("id", postId)
    .single();

  if (error) throw error;
  return data;
};

export const createPost = async (userId: string, postData: CreatePostData) => {
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      user_id: userId,
      content: postData.content,
    })
    .select()
    .single();

  if (postError) throw postError;

  const imageUrls: string[] = [];
  if (postData.images && postData.images.length > 0) {
    for (const image of postData.images) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      imageUrls.push(publicUrl);
    }

    if (imageUrls.length > 0) {
      const imageInserts = imageUrls.map((url) => ({
        post_id: post.id,
        url,
      }));

      const { error: imageError } = await supabase
        .from("images")
        .insert(imageInserts);

      if (imageError) throw imageError;
    }
  }

  return post;
};

export const updatePost = async (postId: number, updates: PostUpdate) => {
  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePost = async (postId: number) => {
  const { data: images } = await supabase
    .from("images")
    .select("url")
    .eq("post_id", postId);

  if (images) {
    for (const image of images) {
      const path = image.url.split("/").pop();
      if (path) {
        await supabase.storage.from("images").remove([`post-images/${path}`]);
      }
    }
  }

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) throw error;
};

export const searchUsers = async (query: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, profile_image_url")
    .ilike("username", `%${query}%`)
    .limit(10);

  if (error) throw error;
  return data;
};
