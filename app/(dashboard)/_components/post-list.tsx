"use client";

import InfiniteScroll from "@/components/infinite-scroll";
import { Skeleton } from "@/components/ui/skeleton";
import { getPostsWithPagination } from "@/lib/database";
import { createClient } from "@/lib/supabase/client";
import { PostWithAttachments } from "@/types/database";
import { useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo } from "react";
import PostCard from "./post-card";

export const SkeletonPost = () => (
  <div className="flex flex-col gap-2">
    <Skeleton className="aspect-square w-full rounded-none" />
    <div className="flex gap-2">
      <Skeleton className="w-6 h-6 rounded-none" />
      <Skeleton className="w-6 h-6 rounded-none" />
      <Skeleton className="w-6 h-6 rounded-none" />
    </div>
    <Skeleton className="w-full h-4" />
    <Skeleton className="w-full h-4" />
    <Skeleton className="w-full h-4" />
  </div>
);

export default function PostList() {
  const client = createClient();

  const {
    isLoading,
    isError,
    error,
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => getPostsWithPagination(client, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length > 0 ? pages.length : undefined;
    },
  });

  const groupPostsByDate = useMemo(
    () =>
      data?.pages.reduce(
        (groups: Record<string, PostWithAttachments[]>, page) => {
          page.forEach((post) => {
            const date = dayjs(post.created_at).format("YYYY-MM-DD");
            if (!groups[date]) {
              groups[date] = [];
            }
            groups[date].push(post);
          });
          return groups;
        },
        {} as Record<string, PostWithAttachments[]>
      ) ?? {},
    [data]
  );

  if (isLoading) return <SkeletonPost />;

  if (isError) return <div className="text-destructive">{error.message}</div>;

  return (
    <InfiniteScroll
      isLoadingIntial={isLoading}
      isLoadingMore={isFetchingNextPage}
      loadMore={() => hasNextPage && fetchNextPage()}
    >
      <div className="flex flex-col gap-6">
        {Object.entries(groupPostsByDate).map(([date, posts]) => (
          <div key={date} className="relative flex flex-col gap-4">
            <div className="font-normal mx-auto border px-2 py-1 text-xs sticky top-2 z-20 bg-background rounded-md w-fit">
              {dayjs(date).format("YYYY-MM-DD")}
            </div>
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
}
