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
import { Plus, X } from "lucide-react";
import { generateId } from "@/lib/utils";
import { createPost } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";

type UploadedImage = {
  id: string;
  file: File;
  url: string;
};

export default function CreatePosterDrawer() {
  const { user } = useAuth();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const next: UploadedImage[] = [];
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      next.push({ id: generateId(), file, url });
    });

    if (next.length === 0) return;
    setImages((prev) => [...prev, ...next]);

    event.target.value = "";
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handlePost = async () => {
    setIsPosting(true);
    const res = await createPost(user?.id ?? "", {
      content,
      images: images.map((img) => img.file),
    });
    console.log(res);

    setImages([]);
    setContent("");
    setIsPosting(false);
  };

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, [images]);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="fixed w-full bottom-4 left-0 flex justify-center">
          <Button className="rounded-full" size="icon">
            <Plus />
          </Button>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>New Post</DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col px-4 gap-4">
            <div className="flex flex-wrap gap-2">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden border"
                >
                  <button
                    className="absolute cursor-pointer top-1 right-1 z-20 rounded-md p-1 bg-black/50 hover:bg-black/70 transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                    onClick={() => handleRemoveImage(img.id)}
                    aria-label="Remove image"
                    title="Remove image"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <Image
                    src={img.url}
                    alt="uploaded preview"
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer w-24 h-24 flex-shrink-0 rounded-md border-2 border-dashed border-muted-foreground/40 hover:border-muted-foreground/60 grid place-items-center text-muted-foreground/70 hover:text-muted-foreground transition"
                aria-label="Upload images"
              >
                <Plus className="w-6 h-6" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleSelectImages}
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
