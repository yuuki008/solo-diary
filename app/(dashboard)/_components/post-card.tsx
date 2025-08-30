"use client";

import AttachmentsCarousel from "@/components/attachments-carousel";
import { formatTime } from "@/lib/utils";
import { PostWithAttachments } from "@/types/database";
import { Trash2 } from "lucide-react";
import { deletePost } from "@/lib/database";
import { useState } from "react";
import PostContent from "@/components/post-content";

export default function PostCard({
  post,
  onDeleted,
}: {
  post: PostWithAttachments;
  onDeleted?: (postId: number) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    const ok = window.confirm(
      "この投稿を削除しますか？この操作は元に戻せません。"
    );
    if (!ok) return;
    try {
      setIsDeleting(true);
      await deletePost(post.id);
      onDeleted?.(post.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col pb-4 relative group">
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute cursor-pointer top-1 right-1 z-30 bg-background/50 hover:bg-background/80 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-60"
        aria-label="delete post"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <AttachmentsCarousel attachments={post.post_attachments} />
      <PostContent
        text={post.content || ""}
        className="text-sm overflow-wrap whitespace-pre-wrap break-words mt-4"
      />
      <div className="text-xs text-muted-foreground ml-auto mt-1">
        {formatTime(post.created_at)}
      </div>
    </div>
  );
}
