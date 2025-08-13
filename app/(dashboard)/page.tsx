import { getUserPosts } from "@/lib/database";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import CreatePosterDrawer from "./create-poster-drawer";

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
      <CreatePosterDrawer />
    </div>
  );
}
