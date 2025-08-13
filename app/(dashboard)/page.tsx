import { Button } from "@/components/ui/button";
import { getUserPosts } from "@/lib/database";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import { cookies } from "next/headers";

export default async function Home() {
  const supabase = await createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const posts = await getUserPosts(user?.id ?? "");

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
      <div className="fixed w-full bottom-4 left-0 flex justify-center">
        <Button className="rounded-full">
          <Plus />
          New Post
        </Button>
      </div>
    </div>
  );
}
