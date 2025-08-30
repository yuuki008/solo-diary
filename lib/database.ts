import { supabase } from "./supabase/client";
import {
  PostUpdate,
  PostWithAttachments,
  CreatePostData,
  Post,
} from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";
import { getRange } from "./utils";

export const getPostsWithPagination = async (
  client: SupabaseClient,
  page: number
): Promise<PostWithAttachments[]> => {
  const [from, to] = getRange(page, 10);

  const { data, error } = await client
    .from("posts")
    .select("*, post_attachments(*)")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return data;
};

export const createPost = async (
  userId: string,
  postData: CreatePostData
): Promise<Post> => {
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      user_id: userId,
      content: postData.content,
    })
    .select()
    .single();

  if (postError) throw postError;

  const attachmentUrls: { url: string; mime_type: string }[] = [];
  if (postData.attachments && postData.attachments.length > 0) {
    for (const file of postData.attachments) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const topLevel = (file.type || "application/octet-stream").split("/")[0];
      const folder =
        topLevel === "image"
          ? "images"
          : topLevel === "video"
          ? "videos"
          : topLevel === "audio"
          ? "audios"
          : "files";
      const filePath = `post-attachments/${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("post-attachments")
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("post-attachments").getPublicUrl(filePath);

      attachmentUrls.push({ url: publicUrl, mime_type: file.type });
    }

    if (attachmentUrls.length > 0) {
      const inserts = attachmentUrls.map((a) => ({
        post_id: post.id,
        url: a.url,
        mime_type: a.mime_type,
      }));

      const { error: insertError } = await supabase
        .from("post_attachments")
        .insert(inserts);

      if (insertError) throw insertError;
    }
  }

  return post;
};

export const updatePost = async (
  postId: number,
  updates: PostUpdate
): Promise<Post> => {
  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePost = async (postId: number): Promise<void> => {
  const { data: attachments } = await supabase
    .from("post_attachments")
    .select("url")
    .eq("post_id", postId);

  if (attachments) {
    for (const att of attachments) {
      const url = att.url;
      const idx = url.indexOf("/post-attachments/");
      if (idx >= 0) {
        const path = url.substring(idx + 1 + "post-attachments".length + 1); // after bucket name
        if (path) {
          await supabase.storage.from("post-attachments").remove([path]);
        }
      }
    }
  }

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) throw error;
};
