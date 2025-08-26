"use client";

import PostList from "./_components/post-list";
import CreatePostForm from "./_components/create-post-form";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PostWithAttachments } from "@/types/database";
import { getUserPostsClient } from "@/lib/database";
import dayjs from "dayjs";

export default function Home() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? undefined;

  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [allPosts, setAllPosts] = useState<PostWithAttachments[]>([]);
  const [nextPage, setNextPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(
    async (pageIndex: number) => {
      if (!user?.id) return { posts: [], hasMore: false };

      const posts = await getUserPostsClient({
        userId: user.id,
        date,
        limit: 10,
        page: pageIndex,
      });
      return posts;
    },
    [user, date]
  );

  const onPostCreated = useCallback(async () => {
    setIsFetching(true);
    const { posts, hasMore } = await fetchPage(0);
    setAllPosts(posts);
    setHasMore(hasMore);
    setNextPage(1);
    setIsFetching(false);
  }, [fetchPage]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsFetching(true);
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

  const handlePostDeleted = useCallback((postId: number) => {
    setAllPosts((prev) => prev.filter((post) => post.id !== postId));
  }, []);

  return (
    <div className="flex flex-col relative max-w-lg w-[95%] mx-auto">
      <div className="pt-6 pb-[50vh]">
        <PostList
          posts={allPosts}
          groupPostsByDate={groupPostsByDate}
          isFetching={isFetching}
          isLoadingMore={isLoadingMore}
          handlePostDeleted={handlePostDeleted}
        />
      </div>

      <CreatePostForm onPostCreated={onPostCreated} />
    </div>
  );
}
