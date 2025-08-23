"use client";

import { useAuth } from "@/contexts/AuthContext";
import PostList from "./_components/post-list";
import CreatePostForm from "./_components/create-post-form";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-4 relative">
      {user && <PostList userId={user.id} />}
      <div className="fixed w-full left-0 bottom-4 z-20 flex justify-center">
        <CreatePostForm />
      </div>
    </div>
  );
}
