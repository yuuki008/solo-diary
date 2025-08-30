"use client";

import { Loader2 } from "lucide-react";
import React, { useEffect, useRef } from "react";

type Props = {
  isLoadingIntial: boolean;
  isLoadingMore: boolean;
  children: React.ReactNode;
  loadMore: () => void;
};

function InfiniteScroll(props: Props) {
  const observerElement = useRef<HTMLDivElement | null>(null);
  const { isLoadingIntial, isLoadingMore, children, loadMore } = props;

  useEffect(() => {
    function handleIntersection(entries: IntersectionObserverEntry[]) {
      entries.forEach((entry) => {
        if (entry.isIntersecting && (!isLoadingMore || !isLoadingIntial)) {
          loadMore();
        }
      });
    }

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    });

    if (observerElement.current) {
      observer.observe(observerElement.current);
    }

    return () => observer.disconnect();
  }, [isLoadingMore, isLoadingIntial, loadMore]);

  return (
    <>
      {children}

      <div ref={observerElement} id="obs">
        {isLoadingMore && !isLoadingIntial && (
          <div className="flex justify-center items-center h-20 py-4">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
      </div>
    </>
  );
}

export default InfiniteScroll;
