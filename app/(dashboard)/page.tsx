import { getPostsWithPagination } from "@/lib/database";
import { createClient } from "@/lib/supabase/server";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import PostList from "./_components/post-list";
import CreatePostForm from "./_components/create-post-form";

async function page() {
  const queryClient = new QueryClient();
  const supabase = await createClient(cookies());

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => getPostsWithPagination(supabase, pageParam),
    initialPageParam: 0,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col relative max-w-lg w-[95%] mx-auto">
        <div className="pt-6 pb-[50vh]">
          <PostList />
        </div>
      </div>
      <CreatePostForm />
    </HydrationBoundary>
  );
}

export default page;
