"use client";

import AttachmentsCarousel from "@/components/attachments-carousel";
import { PostWithAttachments } from "@/types/database";

export default function PostCard({ post }: { post: PostWithAttachments }) {
  return (
    <div className="flex flex-col">
      <AttachmentsCarousel attachments={post.post_attachments} />
      <div className="text-sm overflow-wrap break-words mt-2">
        {post.content}
      </div>
    </div>
  );
}
