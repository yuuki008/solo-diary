"use client";

import { getUserPosts } from "@/lib/database";
import CreatePosterDrawer from "./create-poster-drawer";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { PostWithImages } from "@/types/database";

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithImages[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      const posts = await getUserPosts(user.id);
      setPosts(posts);
    };
    fetchPosts();
  }, [user]);

  return (
    <div className="flex flex-col gap-4">
      {posts.length === 0 ? (
        <div className="text-center text-2xl">No posts yet</div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <div key={post.id}>{post.content}</div>
          ))}
        </div>
      )}
      <CreatePosterDrawer />
    </div>
  );
}
