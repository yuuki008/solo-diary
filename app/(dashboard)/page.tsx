"use client";

import CreatePosterDrawer from "./create-poster-drawer";
import { useAuth } from "@/contexts/AuthContext";
import PostList from "./_components/post-list";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-4 relative">
      {user && <PostList userId={user.id} />}
      <div className="fixed w-full left-0 bottom-4 z-20 flex justify-center">
        <div className="flex justify-center border rounded-full bg-background/80">
          <CreatePosterDrawer />
          <Button
            title="Settings"
            className="rounded-full"
            size="icon"
            variant="ghost"
          >
            <Settings className="!w-5 !h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
