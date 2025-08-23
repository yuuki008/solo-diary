"use client";

import CreatePosterDrawer from "./_components/create-poster-drawer";
import { useAuth } from "@/contexts/AuthContext";
import PostList from "./_components/post-list";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-4 relative">
      {user && <PostList userId={user.id} />}
      <div className="fixed w-full left-0 bottom-4 z-20 flex justify-center">
        <CreatePosterDrawer />
      </div>
    </div>
  );
}
