import { PostWithImages } from "@/types/database";
import dayjs from "dayjs";
import PostCard from "./post-card";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserPostsClient } from "@/lib/database";

type PostListProps = {
  isFetching: boolean;
  posts: PostWithImages[];
  userId: string;
  date?: string;
};
export default function PostList(props: PostListProps) {
  const [list, setList] = useState<PostWithImages[]>(props.posts);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setList(props.posts);
    setPage(1);
    setHasMore(props.posts.length >= 10);
  }, [props.posts, props.userId, props.date]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const { posts: nextPosts, hasMore: nextHasMore } = await getUserPostsClient(
      {
        userId: props.userId,
        date: props.date,
        page,
        limit: 10,
      }
    );
    setList((prev) => [...prev, ...nextPosts]);
    setPage((p) => p + 1);
    setHasMore(nextHasMore);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, props.userId, props.date, page]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !props.isFetching) {
          loadMore();
        }
      },
      { root: null, rootMargin: "0px", threshold: 1.0 }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [loadMore, props.isFetching]);

  const groupPostsByDate = useMemo(
    () =>
      list.reduce((groups: Record<string, PostWithImages[]>, post) => {
        const date = dayjs(post.created_at).format("YYYY-MM-DD");
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(post);
        return groups;
      }, {} as Record<string, PostWithImages[]>),
    [list]
  );

  return props.isFetching ? (
    <div className="flex flex-col gap-4">
      <Skeleton className="w-[131.24px] h-8 mx-auto" />
      <Skeleton className="w-3/5 h-8" />
      <Skeleton className="w-4/5 h-8" />
      <Skeleton className="w-2/5 h-8" />
      <Skeleton className="w-full h-8" />
    </div>
  ) : list.length === 0 ? (
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
      {isLoadingMore && (
        <div className="flex flex-col gap-4 mt-2">
          <Skeleton className="w-3/5 h-6 mx-auto" />
          <Skeleton className="w-full h-8" />
        </div>
      )}
    </div>
  );
}
