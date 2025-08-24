export const dynamic = "force-dynamic";

type LinkPreview = {
  url: string;
  title: string | null;
  icon: string | null;
  domain: string;
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function resolveUrl(base: string, href: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function extractTitle(html: string): string | null {
  const head = html.slice(0, 150_000);
  const titleMatch = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    const raw = titleMatch[1].trim();
    return decodeHtmlEntities(raw).replace(/\s+/g, " ").slice(0, 200) || null;
  }
  // Fallback to og:title
  const ogMatch = head.match(
    /<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i
  );
  if (ogMatch && ogMatch[1]) {
    return decodeHtmlEntities(ogMatch[1]).slice(0, 200);
  }
  return null;
}

function extractIcon(html: string, pageUrl: string): string | null {
  const head = html.slice(0, 200_000);
  const icons: { rel: string; href: string }[] = [];

  const linkRegex = /<link\s+[^>]*>/gi;
  const relRegex = /rel=["']([^"']+)["']/i;
  const hrefRegex = /href=["']([^"']+)["']/i;

  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(head))) {
    const tag = match[0];
    const relMatch = tag.match(relRegex);
    const hrefMatch = tag.match(hrefRegex);
    if (!relMatch || !hrefMatch) continue;
    const rel = relMatch[1].toLowerCase();
    const href = hrefMatch[1];
    if (rel.includes("icon") || rel.includes("apple-touch-icon")) {
      icons.push({ rel, href });
    }
  }

  // Prefer apple-touch-icon, then any icon
  const preferred =
    icons.find((i) => i.rel.includes("apple-touch-icon")) ||
    icons.find((i) => i.rel.includes("icon"));

  if (preferred) {
    const resolved = resolveUrl(pageUrl, preferred.href);
    if (resolved) return resolved;
  }

  // Fallback to og:image as a last resort
  const ogImageMatch = head.match(
    /<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i
  );
  if (ogImageMatch && ogImageMatch[1]) {
    const resolved = resolveUrl(pageUrl, ogImageMatch[1]);
    if (resolved) return resolved;
  }

  try {
    const { hostname } = new URL(pageUrl);
    return `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");
  if (!target) {
    return Response.json({ error: "url is required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
    if (!/^https?:$/.test(parsed.protocol)) {
      return Response.json({ error: "unsupported protocol" }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "invalid url" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch(parsed.toString(), {
      method: "GET",
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; SoloDiaryBot/1.0; +https://example.local)",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      const domain = parsed.hostname;
      const fallback: LinkPreview = {
        url: parsed.toString(),
        title: null,
        icon: `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        domain,
      };
      return Response.json(fallback, {
        headers: { "cache-control": "public, max-age=3600, s-maxage=86400" },
      });
    }

    let html = await res.text();
    if (html.length > 500_000) html = html.slice(0, 500_000);

    const title = extractTitle(html);
    const icon = extractIcon(html, parsed.toString());
    const data: LinkPreview = {
      url: parsed.toString(),
      title,
      icon,
      domain: parsed.hostname,
    };

    return Response.json(data, {
      headers: { "cache-control": "public, max-age=3600, s-maxage=86400" },
    });
  } catch {
    const domain = parsed.hostname;
    const fallback: LinkPreview = {
      url: parsed.toString(),
      title: null,
      icon: `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      domain,
    };
    return Response.json(fallback, {
      status: 200,
      headers: { "cache-control": "public, max-age=600, s-maxage=3600" },
    });
  } finally {
    clearTimeout(timeout);
  }
}
