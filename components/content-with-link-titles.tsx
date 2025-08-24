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

const URL_REGEX =
  /https?:\/\/[\w.-]+(?:\.[\w.-]+)+(?:[\w\-._~:?#\[\]@!$&'()*+,;=%/]+)?/gi;

function extractUrls(text: string): string[] {
  if (!text) return [];
  const matches = text.match(URL_REGEX) || [];
  return Array.from(new Set(matches));
}

export function ContentWithLinkTitles({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [previews, setPreviews] = useState<Record<string, LinkPreview>>({});
  const urls = useMemo(() => extractUrls(text || ""), [text]);

  useEffect(() => {
    let aborted = false;
    async function loadAll() {
      if (urls.length === 0) {
        setPreviews({});
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
      const map: Record<string, LinkPreview> = {};
      for (const r of results) {
        if (r.status === "fulfilled") {
          const [u, data] = r.value;
          map[u] = data;
        }
      }
      setPreviews(map);
    }
    loadAll();
    return () => {
      aborted = true;
    };
  }, [urls]);

  function renderContentWithTitles(t: string): ReactNode[] | null {
    if (!t) return null;
    const nodes: ReactNode[] = [];
    const regex = new RegExp(URL_REGEX);
    regex.lastIndex = 0;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(t)) !== null) {
      const start = match.index;
      const end = regex.lastIndex;
      const url = match[0];
      if (start > lastIndex) nodes.push(t.slice(lastIndex, start));
      const preview = previews[url];
      const title = preview?.title || preview?.domain || url;
      const icon = preview?.icon;

      nodes.push(
        <a
          key={`u-${start}-${end}`}
          href={url}
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
      lastIndex = end;
    }
    if (lastIndex < t.length) nodes.push(t.slice(lastIndex));
    return nodes;
  }

  return (
    <div className={cn("text-sm", className)}>
      {renderContentWithTitles(text)}
    </div>
  );
}
