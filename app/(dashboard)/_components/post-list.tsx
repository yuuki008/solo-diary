import { PostWithImages } from "@/types/database";
import dayjs from "dayjs";
import PostCard from "./post-card";
import SelectDateDialog from "./select-date";

type PostListProps = {
  posts: PostWithImages[];
};
export default function PostList(props: PostListProps) {
  const groupPostsByDate = props.posts.reduce(
    (groups: Record<string, PostWithImages[]>, post) => {
      const date = dayjs(post.created_at).format("YYYY-MM-DD");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(post);
      return groups;
    },
    {} as Record<string, PostWithImages[]>
  );

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(groupPostsByDate).map(([date, posts]) => (
        <div key={date} className="relative flex flex-col gap-4">
          <SelectDateDialog date={date} />
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
