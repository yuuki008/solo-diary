"use client";

import AttachmentsCarousel from "@/components/attachments-carousel";
import { formatDatetime } from "@/lib/utils";
import { PostWithAttachments } from "@/types/database";

export default function PostCard({ post }: { post: PostWithAttachments }) {
  return (
    <div className="flex flex-col border-b pb-4">
      <AttachmentsCarousel attachments={post.post_attachments} />
      <div className="text-sm overflow-wrap break-words mt-4">
        {post.content}
      </div>
      <div className="text-xs text-muted-foreground ml-auto mt-1">
        {formatDatetime(post.created_at)}
      </div>
    </div>
  );
}
