"use client";

import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type LinkPreview = {
  url: string;
  title: string | null;
  icon: string | null;
  domain: string;
};

const URL_PATTERN =
  /https?:\/\/[\w.-]+(?:\.[\w.-]+)+(?:[\w\-._~:?#\[\]@!$&'()*+,;=%/]+)?/i;
const URL_SPLIT_REGEX = new RegExp(`(${URL_PATTERN.source})`, "gi");

function isUrl(text: string): boolean {
  return new RegExp(URL_PATTERN.source, "i").test(text);
}

function getDistinctUrls(text: string): string[] {
  if (!text) return [];
  const matches = text.match(new RegExp(URL_PATTERN.source, "gi")) || [];
  return Array.from(new Set(matches));
}

// 3) 取得フック
function useLinkPreviews(urls: string[]) {
  const [map, setMap] = useState<Record<string, LinkPreview>>({});

  useEffect(() => {
    let aborted = false;
    async function loadAll() {
      if (urls.length === 0) {
        setMap({});
        return;
      }
      const results = await Promise.allSettled(
        urls.map(async (u) => {
          const res = await fetch(
            `/api/link-preview?url=${encodeURIComponent(u)}`,
            {
              method: "GET",
              cache: "force-cache",
            }
          );
          if (!res.ok) throw new Error("failed");
          const data = (await res.json()) as LinkPreview;
          return [u, data] as const;
        })
      );
      if (aborted) return;
      const next: Record<string, LinkPreview> = {};
      for (const r of results) {
        if (r.status === "fulfilled") {
          const [u, data] = r.value;
          next[u] = data;
        }
      }
      setMap(next);
    }
    loadAll();
    return () => {
      aborted = true;
    };
  }, [urls]);

  return map;
}

export function ContentWithLinkTitles({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const urls = useMemo(() => getDistinctUrls(text || ""), [text]);
  const previews = useLinkPreviews(urls);

  function renderContent(t: string): ReactNode[] | null {
    if (!t) return null;
    const parts = t.split(URL_SPLIT_REGEX).filter((p) => p !== "");
    return parts.map((chunk, i) => {
      if (!isUrl(chunk)) return chunk;
      const preview = previews[chunk];
      const title = preview?.title || preview?.domain || chunk;
      const icon = preview?.icon;
      return (
        <a
          key={`url-${i}-${chunk}`}
          href={chunk}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline inline-flex items-baseline gap-1 leading-[inherit]"
        >
          {icon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={icon}
              alt="favicon"
              className="inline-block w-[1em] h-[1em] self-baseline rounded-sm border border-border"
              loading="lazy"
              decoding="async"
            />
          )}
          <span>{title}</span>
        </a>
      );
    });
  }

  return <div className={cn("text-sm", className)}>{renderContent(text)}</div>;
}
