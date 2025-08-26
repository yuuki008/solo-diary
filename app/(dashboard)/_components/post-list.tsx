"use client";

import { PostWithAttachments } from "@/types/database";
import dayjs from "dayjs";
import PostCard from "./post-card";
import { useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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

type PostListProps = {
  posts: PostWithAttachments[];
  groupPostsByDate: Record<string, PostWithAttachments[]>;
  isFetching: boolean;
  isLoadingMore: boolean;
  handlePostDeleted: (postId: number) => void;
};

export default function PostList({
  posts,
  groupPostsByDate,
  isFetching,
  isLoadingMore,
  handlePostDeleted,
}: PostListProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  return isFetching ? (
    <SkeletonPost />
  ) : posts.length === 0 ? (
    <div className="text-center text-2xl">No posts yet</div>
  ) : (
    <div className="flex flex-col gap-6">
      {Object.entries(groupPostsByDate).map(([date, posts]) => (
        <div key={date} className="relative flex flex-col gap-4">
          <div className="font-normal mx-auto border px-2 py-1 text-xs sticky top-2 z-20 bg-background rounded-md w-fit">
            {dayjs(date).format("YYYY-MM-DD")}
          </div>
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDeleted={handlePostDeleted}
              />
            ))}
          </div>
        </div>
      ))}
      <div ref={sentinelRef} />
      {isLoadingMore && <SkeletonPost />}
    </div>
  );
}
