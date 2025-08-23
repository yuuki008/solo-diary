"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { AudioLinesIcon, Plus, Send, VideoIcon, X } from "lucide-react";
import { createPost } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { generateId } from "@/lib/utils";

export default function CreatePostForm() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  type Uploaded = { id: string; file: File; url: string };
  const [attachments, setAttachments] = useState<Uploaded[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowed: Uploaded[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type) return;
      if (
        file.type.startsWith("image/") ||
        file.type.startsWith("video/") ||
        file.type.startsWith("audio/")
      ) {
        const url = URL.createObjectURL(file);
        allowed.push({ id: generateId(), file, url });
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
      await createPost(user.id, {
        content: content.trim(),
        attachments: attachments.map((a) => a.file),
      });
      setContent("");
      // revoke URLs before reset
      attachments.forEach((a) => URL.revokeObjectURL(a.url));
      setAttachments([]);
    } finally {
      setIsPosting(false);
    }
  };

  const handleRemove = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((a) => a.id !== id);
    });
  };

  useEffect(() => {
    return () => {
      attachments.forEach((a) => URL.revokeObjectURL(a.url));
    };
  }, [attachments]);

  return (
    <div className="relative max-w-lg w-full mx-4">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="relative w-16 h-16 rounded-md overflow-hidden border flex-shrink-0"
            >
              <button
                type="button"
                onClick={() => handleRemove(att.id)}
                className="cursor-pointer absolute top-0.5 right-0.5 z-10 rounded bg-black/50 p-1 hover:bg-black/70"
                aria-label="Remove file"
                title="Remove"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
              {att.file.type.startsWith("image/") ? (
                <Image
                  src={att.url}
                  alt="preview"
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                />
              ) : att.file.type.startsWith("video/") ? (
                <div className="w-full h-full relative">
                  <video
                    src={att.url}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 grid place-items-center bg-background/40">
                    <VideoIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
              ) : att.file.type.startsWith("audio/") ? (
                <div className="w-full h-full relative grid place-items-center bg-muted">
                  <AudioLinesIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              ) : (
                <div className="w-full h-full grid place-items-center text-xs">
                  file
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />

        <div className="relative">
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
        </div>
      </form>
    </div>
  );
}
