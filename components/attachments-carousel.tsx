"use client";

import { PostWithAttachments } from "@/types/database";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
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
  const count = attachments.length;
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

  if (count === 0) return null;

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
            <CarouselItem
              key={index}
              className="w-full flex items-center justify-center max-h-[500px]"
            >
              {att.mime_type.startsWith("image/") ? (
                <div className="relative w-full aspect-square max-h-[500px]">
                  <Image
                    src={att.url}
                    alt={att.url}
                    fill
                    priority={index === 0}
                    loading="eager"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px"
                    className="object-contain mx-auto"
                  />
                </div>
              ) : att.mime_type.startsWith("video/") ? (
                <video
                  src={att.url}
                  className="object-cover h-full w-auto mx-auto"
                  autoPlay
                  loop
                  muted={!(current === index + 1)}
                  playsInline
                  preload="metadata"
                />
              ) : att.mime_type.startsWith("audio/") ? (
                <audio
                  src={att.url}
                  className="object-cover w-full h-full"
                  controls
                />
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
      </Carousel>

      {count > 1 && (
        <div
          ref={thumbnailsContainerRef}
          className="mt-1 flex items-center gap-2 overflow-x-auto scrollbar-hide h-10 px-2"
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
                  "cursor-pointer relative flex-shrink-0 transition-all duration-300",
                  isSelected ? "w-8 h-8" : "w-6 h-6 opacity-60"
                )}
              >
                {att.mime_type.startsWith("image/") ? (
                  <Image
                    src={att.url}
                    alt={att.url}
                    width={256}
                    height={256}
                    sizes="64px"
                    className="object-cover w-full h-full"
                  />
                ) : att.mime_type.startsWith("video/") ? (
                  <video
                    src={att.url}
                    className="object-cover w-full h-full"
                    muted
                    playsInline
                    preload="metadata"
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
