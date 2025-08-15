import { PostWithImages } from "@/types/database";
import Image from "next/image";
import { cn } from "@/lib/utils";

const MAX_DISPLAY_IMAGES = 4;

export default function PostCard({ post }: { post: PostWithImages }) {
  const displayImages = post.images.slice(0, MAX_DISPLAY_IMAGES);

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "grid w-full gap-1 rounded overflow-hidden",
          post.images.length === 3 ? "grid-cols-3" : "grid-cols-2"
        )}
      >
        {displayImages.map((image, index) => {
          const isLastVisibleImageAndHasMore =
            index === displayImages.length - 1 &&
            post.images.length > MAX_DISPLAY_IMAGES;

          const remainingImages = post.images.length - MAX_DISPLAY_IMAGES;

          return (
            <div
              key={index}
              className="flex relative items-center justify-center aspect-square hover:bg-muted/50 transition"
              tabIndex={0}
              role="button"
              aria-label={`Enlarge image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={`${post.content} ${index + 1}`}
                width={1000}
                height={1000}
                className="object-cover w-full h-full"
              />

              {isLastVisibleImageAndHasMore && (
                <div className="absolute z-10 w-full h-full bg-black/50 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    +{remainingImages}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-sm overflow-wrap break-words">{post.content}</div>
    </div>
  );
}
