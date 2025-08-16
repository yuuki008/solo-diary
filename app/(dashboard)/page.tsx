"use client";

import { getUserPosts } from "@/lib/database";
import CreatePosterDrawer from "./create-poster-drawer";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { PostWithImages } from "@/types/database";
import PostList from "./_components/post-list";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

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
    <div className="flex flex-col gap-4 relative">
      <PostList posts={posts} isFetching={isFetching} />
      <div className="fixed w-full left-0 bottom-4 z-20 flex justify-center">
        <div className="flex justify-center border rounded-full bg-background/80">
          <CreatePosterDrawer />
          <Button className="rounded-full" size="icon" variant="ghost">
            <Settings className="!w-5 !h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
