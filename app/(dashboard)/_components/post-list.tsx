"use client";

import { PostWithAttachments } from "@/types/database";
import dayjs from "dayjs";
import PostCard from "./post-card";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserPostsClient } from "@/lib/database";
import { useSearchParams } from "next/navigation";

type PostListProps = {
  userId: string;
};
export default function PostList(props: PostListProps) {
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? undefined;

  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [allPosts, setAllPosts] = useState<PostWithAttachments[]>([]);
  const [nextPage, setNextPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(
    async (pageIndex: number) =>
      getUserPostsClient({
        userId: props.userId,
        date,
        limit: 10,
        page: pageIndex,
      }),
    [props.userId, date]
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsFetching(true);
      setAllPosts([]);
      setHasMore(true);
      setNextPage(0);
      const { posts, hasMore } = await fetchPage(0);
      if (cancelled) return;
      setAllPosts(posts);
      setHasMore(hasMore);
      setNextPage(1);
      setIsFetching(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const { posts: nextPosts, hasMore: nextHasMore } = await fetchPage(
      nextPage
    );
    setAllPosts((prev) => [...prev, ...nextPosts]);
    setNextPage((p) => p + 1);
    setHasMore(nextHasMore);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, fetchPage, nextPage]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isFetching) {
          loadMore();
        }
      },
      { root: null, rootMargin: "0px", threshold: 1.0 }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [loadMore, isFetching]);

  const groupPostsByDate = useMemo(
    () =>
      allPosts.reduce((groups: Record<string, PostWithAttachments[]>, post) => {
        const date = dayjs(post.created_at).format("YYYY-MM-DD");
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(post);
        return groups;
      }, {} as Record<string, PostWithAttachments[]>),
    [allPosts]
  );

  const SkeletonRows = ({ rows = 5 }: { rows?: number }) => (
    <div className="flex flex-col gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="w-full h-8" />
      ))}
    </div>
  );

  return isFetching ? (
    <SkeletonRows rows={5} />
  ) : allPosts.length === 0 ? (
    <div className="text-center text-2xl">No posts yet</div>
  ) : (
    <div className="flex flex-col gap-6">
      {Object.entries(groupPostsByDate).map(([date, posts]) => (
        <div key={date} className="relative flex flex-col gap-4">
          <div className="font-normal mx-auto border px-2 py-1 text-xs sticky top-5 z-20 bg-background rounded-md w-fit">
            {dayjs(date).format("YYYY-MM-DD")}
          </div>
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      ))}
      <div ref={sentinelRef} />
      {isLoadingMore && <SkeletonRows rows={3} />}
    </div>
  );
}
