"use client";

import AttachmentsCarousel from "@/components/attachments-carousel";
import { formatDatetime } from "@/lib/utils";
import { PostWithAttachments } from "@/types/database";
import { Trash2 } from "lucide-react";

export default function PostCard({ post }: { post: PostWithAttachments }) {
  return (
    <div className="flex flex-col border-b pb-4 relative group">
      <button className="absolute cursor-pointer top-1 right-1 z-10 bg-background/50 hover:bg-background/80 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
        <Trash2 className="w-4 h-4" />
      </button>
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
