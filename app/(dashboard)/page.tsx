"use client";

import { useAuth } from "@/contexts/AuthContext";
import PostList from "./_components/post-list";
import CreatePostForm from "./_components/create-post-form";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-4 relative h-dvh p-6">
      <div className="overflow-y-auto flex-1 scrollbar-hide">
        {user && <PostList userId={user.id} />}
      </div>
      <CreatePostForm />
    </div>
  );
}
