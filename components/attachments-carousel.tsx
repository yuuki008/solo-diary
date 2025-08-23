"use client";

import { PostWithAttachments } from "@/types/database";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function AttachmentsCarousel({
  attachments,
}: {
  attachments: PostWithAttachments["post_attachments"];
}) {
  const [index, setIndex] = useState(0);
  const count = attachments.length;

  if (count === 0) return null;

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(count - 1, i + 1));

  return (
    <div className="relative w-full rounded-lg overflow-hidden mb-2">
      <div
        className="flex w-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {attachments.map((att, i) => (
          <div key={i} className="w-full flex-shrink-0 aspect-square bg-muted">
            {att.mime_type.startsWith("image/") ? (
              <div className="relative w-full h-full">
                <Image
                  src={att.url}
                  alt={`attachment ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                />
              </div>
            ) : att.mime_type.startsWith("video/") ? (
              <video
                src={att.url}
                className="w-full h-full object-cover"
                controls
                preload="metadata"
              />
            ) : att.mime_type.startsWith("audio/") ? (
              <div className="w-full h-full grid place-items-center bg-muted">
                <audio controls className="w-11/12">
                  <source src={att.url} type={att.mime_type} />
                </audio>
              </div>
            ) : (
              <a
                href={att.url}
                target="_blank"
                rel="noreferrer"
                className="grid place-items-center w-full h-full text-sm underline"
              >
                Attachment
              </a>
            )}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === index ? "bg-white" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
