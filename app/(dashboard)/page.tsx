"use client";

import { getUserPosts } from "@/lib/database";
import CreatePosterDrawer from "./create-poster-drawer";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { PostWithImages } from "@/types/database";
import PostList from "./_components/post-list";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? undefined;

  const [posts, setPosts] = useState<PostWithImages[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      setIsFetching(true);
      const posts = await getUserPosts({ userId: user.id, date });
      setIsFetching(false);
      setPosts(posts);
    };
    fetchPosts();
  }, [user, date]);

  return (
    <div className="flex flex-col gap-4">
      <PostList posts={posts} isFetching={isFetching} />
      <CreatePosterDrawer />
    </div>
  );
}
