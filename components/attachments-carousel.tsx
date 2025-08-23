"use client";

import { PostWithAttachments } from "@/types/database";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export default function AttachmentsCarousel({
  attachments,
}: {
  attachments: PostWithAttachments["post_attachments"];
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const centerThumbnail = (index: number) => {
    const container = thumbnailsContainerRef.current;
    const btn = thumbnailRefs.current[index];
    if (!container || !btn) return;

    const containerWidth = container.clientWidth;
    const targetLeft = btn.offsetLeft - (containerWidth - btn.clientWidth) / 2;
    container.scrollTo({ left: targetLeft, behavior: "smooth" });
  };

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    const initialIndex = api.selectedScrollSnap();
    setCurrent(initialIndex + 1);
    // 初期表示時にもサムネイルを中央に寄せる
    centerThumbnail(initialIndex);

    api.on("select", () => {
      const idx = api.selectedScrollSnap();
      setCurrent(idx + 1);
      centerThumbnail(idx);
    });
  }, [api]);

  return (
    <div>
      <Carousel
        opts={{
          loop: true,
        }}
        className="w-full"
        setApi={setApi}
      >
        <CarouselContent>
          {attachments.map((att, index) => (
            <CarouselItem key={index} className="aspect-square">
              {att.mime_type.startsWith("image/") ? (
                <Image
                  src={att.url}
                  alt={att.url}
                  width={10000}
                  height={10000}
                  className="object-cover w-full h-full"
                />
              ) : att.mime_type.startsWith("video/") ? (
                <video
                  src={att.url}
                  className="object-cover w-full h-full"
                  autoPlay
                  loop
                  muted
                />
              ) : att.mime_type.startsWith("audio/") ? (
                <audio src={att.url} className="object-cover w-full h-full" />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <p className="text-sm text-muted-foreground">
                    {att.mime_type}
                  </p>
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          variant="ghost"
          className="absolute left-1 top-1/2 -translate-y-1/2"
        />
        <CarouselNext
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2"
        />
      </Carousel>

      {count > 1 && (
        <div
          ref={thumbnailsContainerRef}
          className="mt-2 flex items-center gap-2 overflow-x-auto scrollbar-hide"
        >
          {attachments.map((att, index) => {
            const isSelected = index + 1 === current;
            return (
              <button
                key={index}
                type="button"
                aria-label={`Attachment ${index + 1}`}
                onClick={() => api?.scrollTo(index)}
                ref={(el) => {
                  thumbnailRefs.current[index] = el;
                }}
                className={cn(
                  "relative flex-shrink-0 transition-transform",
                  isSelected ? "w-10 h-10" : "w-8 h-8"
                )}
              >
                {att.mime_type.startsWith("image/") ? (
                  <Image
                    src={att.url}
                    alt={att.url}
                    width={256}
                    height={256}
                    className="object-cover w-full h-full"
                  />
                ) : att.mime_type.startsWith("video/") ? (
                  <video
                    src={att.url}
                    className="object-cover w-full h-full"
                    muted
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
