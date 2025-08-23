"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Plus, Send } from "lucide-react";
import { createPost } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";

export default function CreatePostForm() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowed: File[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type) return;
      if (
        file.type.startsWith("image/") ||
        file.type.startsWith("video/") ||
        file.type.startsWith("audio/")
      ) {
        allowed.push(file);
      }
    });

    if (allowed.length > 0) {
      setAttachments((prev) => [...prev, ...allowed]);
    }
    // 同じファイルを再度選択できるように初期化
    e.target.value = "";
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || isPosting) return;
    if (content.trim().length === 0 && attachments.length === 0) return;

    try {
      setIsPosting(true);
      await createPost(user.id, { content: content.trim(), attachments });
      setContent("");
      setAttachments([]);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="relative max-w-lg w-full mx-4">
      <form onSubmit={handleSubmit} className="w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />

        <button
          type="button"
          onClick={openFilePicker}
          title="Add file"
          aria-label="Add file"
          className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center rounded-full w-9 h-9 hover:bg-muted transition"
        >
          <Plus className="w-5 h-5" />
        </button>

        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What are you thinking?"
          className="pl-12 pr-12 h-12 rounded-full bg-muted/50"
          disabled={!user || isPosting}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              // 単純な送信（改行は Shift+Enter）
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <button
          type="submit"
          disabled={
            !user ||
            isPosting ||
            (content.trim().length === 0 && attachments.length === 0)
          }
          title="Post"
          aria-label="Post"
          className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center rounded-full w-9 h-9 hover:bg-muted transition disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>

        {attachments.length > 0 && (
          <div className="absolute -top-3 -right-3 text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
            {attachments.length}
          </div>
        )}
      </form>
    </div>
  );
}
