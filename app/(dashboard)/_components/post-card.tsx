import { PostWithAttachments } from "@/types/database";

export default function PostCard({ post }: { post: PostWithAttachments }) {
  return (
    <div className="flex flex-col">
      <div className="text-sm overflow-wrap break-words mb-2">
        {post.content}
      </div>
    </div>
  );
}
