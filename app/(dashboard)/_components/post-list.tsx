import { PostWithImages } from "@/types/database";
import dayjs from "dayjs";
import PostCard from "./post-card";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type PostListProps = {
  isFetching: boolean;
  posts: PostWithImages[];
};
export default function PostList(props: PostListProps) {
  const groupPostsByDate = useMemo(
    () =>
      props.posts.reduce((groups: Record<string, PostWithImages[]>, post) => {
        const date = dayjs(post.created_at).format("YYYY-MM-DD");
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(post);
        return groups;
      }, {} as Record<string, PostWithImages[]>),
    [props.posts]
  );

  return props.isFetching ? (
    <div className="flex flex-col gap-4">
      <Skeleton className="w-[131.24px] h-8 mx-auto" />
      <Skeleton className="w-3/5 h-8" />
      <Skeleton className="w-4/5 h-8" />
      <Skeleton className="w-2/5 h-8" />
      <Skeleton className="w-full h-8" />
    </div>
  ) : props.posts.length === 0 ? (
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
    </div>
  );
}
