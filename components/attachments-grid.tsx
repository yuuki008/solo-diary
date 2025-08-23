import { cn } from "@/lib/utils";
import { PostWithAttachments } from "@/types/database";
import Image from "next/image";

const MAX_DISPLAY_ATTACHMENTS = 4;

export default function AttachmentsGrid({
  attachments,
}: {
  attachments: PostWithAttachments["post_attachments"];
}) {
  const displayAttachments = attachments.slice(0, MAX_DISPLAY_ATTACHMENTS);

  return (
    <div
      className={cn(
        "grid w-full gap-1 rounded-lg overflow-hidden mb-4",
        attachments.length === 1
          ? "grid-cols-1"
          : attachments.length === 3
          ? "grid-cols-3"
          : "grid-cols-2"
      )}
    >
      {displayAttachments.map((att, index) => {
        const isLastVisibleImageAndHasMore =
          index === displayAttachments.length - 1 &&
          attachments.length > MAX_DISPLAY_ATTACHMENTS;

        const remaining = attachments.length - MAX_DISPLAY_ATTACHMENTS;

        return (
          <div
            key={index}
            className="flex relative items-center justify-center aspect-square hover:bg-muted/50 transition"
            tabIndex={0}
            role="button"
            aria-label={`Enlarge image ${index + 1}`}
          >
            {att.mime_type.startsWith("image/") ? (
              <Image
                src={att.url}
                alt={`${att.url} ${index + 1}`}
                width={10000}
                height={10000}
                className="object-cover w-full h-full"
              />
            ) : att.mime_type.startsWith("video/") ? (
              <video
                src={att.url}
                className="object-cover w-full h-full"
                muted
                autoPlay
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
                className="text-sm underline"
              >
                Attachment
              </a>
            )}

            {isLastVisibleImageAndHasMore && (
              <div className="absolute z-10 w-full h-full bg-black/50 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  +{remaining}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
