"use client";

import { useAuth } from "@/contexts/AuthContext";
import PostList from "./_components/post-list";
import CreatePostForm from "./_components/create-post-form";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col relative max-w-lg w-[95%] mx-auto h-dvh">
      <div className="overflow-y-auto flex-1 scrollbar-hide pt-6 pb-[50vh]">
        {user && <PostList userId={user.id} />}
      </div>

      <CreatePostForm />
    </div>
  );
}
