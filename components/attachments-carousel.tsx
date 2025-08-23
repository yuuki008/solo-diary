"use client";

import { PostWithAttachments } from "@/types/database";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

export default function AttachmentsCarousel({
  attachments,
}: {
  attachments: PostWithAttachments["post_attachments"];
}) {
  const count = attachments.length;
  if (count === 0) return null;

  return (
    <Carousel
      opts={{
        loop: true,
      }}
      className="w-full"
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
                <p className="text-sm text-muted-foreground">{att.mime_type}</p>
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
  );
}
