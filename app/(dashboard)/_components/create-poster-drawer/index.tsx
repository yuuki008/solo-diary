"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { AudioLinesIcon, Plus, VideoIcon, X } from "lucide-react";
import { generateId } from "@/lib/utils";
import { createPost } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";

type UploadedAttachment = {
  id: string;
  file: File;
  url: string;
};

const Video = ({ src }: { src: string }) => {
  return (
    <div className="w-full h-full relative">
      <video
        src={src}
        className="w-full h-full object-cover"
        muted
        preload="metadata"
      />
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-background/50">
        <VideoIcon className="w-7 h-7 text-white" />
      </div>
    </div>
  );
};

const Audio = ({ src }: { src: string }) => {
  return (
    <div className="w-full h-full relative">
      <audio src={src} className="w-full" controls preload="metadata" />
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-background/50">
        <AudioLinesIcon className="w-7 h-7 text-white" />
      </div>
    </div>
  );
};

export default function CreatePosterDrawer() {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const next: UploadedAttachment[] = [];
    Array.from(fileList).forEach((file) => {
      if (!file.type) return;
      if (
        !(
          file.type.startsWith("image/") ||
          file.type.startsWith("video/") ||
          file.type.startsWith("audio/")
        )
      )
        return;
      const url = URL.createObjectURL(file);
      next.push({ id: generateId(), file, url });
    });

    if (next.length === 0) return;
    setAttachments((prev) => [...prev, ...next]);

    event.target.value = "";
  };

  const handleRemove = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handlePost = async () => {
    setIsPosting(true);
    const res = await createPost(user?.id ?? "", {
      content,
      attachments: attachments.map((att) => att.file),
    });
    console.log(res);

    setAttachments([]);
    setContent("");
    setIsPosting(false);
  };

  useEffect(() => {
    return () => {
      attachments.forEach((att) => URL.revokeObjectURL(att.url));
    };
  }, [attachments]);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full"
          title="Create post"
          size="icon"
        >
          <Plus className="!w-5 !h-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>New Post</DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col px-4 gap-4">
            <div className="flex flex-wrap gap-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="group relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden border"
                >
                  <button
                    className="absolute cursor-pointer top-1 right-1 z-20 rounded-md p-1 bg-black/50 hover:bg-black/70 transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                    onClick={() => handleRemove(att.id)}
                    aria-label="Remove image"
                    title="Remove image"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  {att.file.type.startsWith("image/") ? (
                    <Image
                      src={att.url}
                      alt="uploaded preview"
                      fill
                      sizes="96px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : att.file.type.startsWith("video/") ? (
                    <Video src={att.url} />
                  ) : att.file.type.startsWith("audio/") ? (
                    <Audio src={att.url} />
                  ) : (
                    <></>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer w-24 h-24 flex-shrink-0 rounded-md border-2 border-dashed border-muted-foreground/40 hover:border-muted-foreground/60 grid place-items-center text-muted-foreground/70 hover:text-muted-foreground transition"
                aria-label="Upload attachments"
              >
                <Plus className="w-6 h-6" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*"
                multiple
                onChange={handleSelectFiles}
                className="hidden"
              />
            </div>

            <Textarea
              className="min-h-[250px]"
              placeholder="What's on your mind?"
              value={content}
              onChange={handleContentChange}
            />
          </div>

          <DrawerFooter>
            <Button
              className="w-full"
              onClick={handlePost}
              disabled={isPosting}
            >
              {isPosting ? "Posting..." : "Post"}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
